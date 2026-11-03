// AI 회사별 연결부. 에이전트 루프(ai.js)는 회사가 바뀌어도 그대로고, 여기서 말투만 맞춘다.
//
//   const session = provider.start({ system, prompt, tools })
//   const step = await session.next(onText)   // 모델 한 번 부르기. 글자는 onText 로 흘려보낸다
//     -> { calls: [{ id, name, input }], refused?, truncated? }
//   session.reply([{ id, name, output, isError? }])   // 도구 결과를 다음 차례에 같이 보낸다
//
// 세 회사 모두 "모델이 도구를 부르겠다고 하면, 우리가 실행해서 결과를 돌려준다" 는 구조는 같다.
// 다른 것은 메시지 모양뿐이다: Claude 는 tool_use / tool_result, OpenAI 는 function_call / function_call_output,
// Gemini 는 functionCall / functionResponse.
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

const MAX_TOKENS = 8000; // 한 번 답할 때 최대 길이 (비용 상한)

export const PROVIDERS = {
  anthropic: { label: 'Claude', keyEnv: 'ANTHROPIC_API_KEY', model: 'claude-opus-5-5', create: anthropic },
  openai: { label: 'OpenAI', keyEnv: 'OPENAI_API_KEY', model: 'gpt-6-luna', create: openai },
  gemini: { label: 'Gemini', keyEnv: 'GEMINI_API_KEY', model: 'gemini-3.6-flash', create: gemini },
};

// .env 를 보고 쓸 회사를 고른다. AI_PROVIDER 가 있으면 그것, 없으면 키가 있는 첫 회사. 아무 키도 없으면 null (모의 AI)
export function pickProvider(env = process.env) {
  const want = String(env.AI_PROVIDER || '').trim().toLowerCase();
  if (want === 'mock') return null;
  const names = want ? [want] : Object.keys(PROVIDERS);
  for (const name of names) {
    const p = PROVIDERS[name];
    if (!p) {
      console.warn(`> AI_PROVIDER=${want} 는 모르는 값입니다. anthropic, openai, gemini, mock 중 하나를 쓰세요`);
      return null;
    }
    if (!env[p.keyEnv]) {
      if (want) console.warn(`> AI_PROVIDER=${want} 인데 ${p.keyEnv} 가 비어 있어 모의 AI 로 돕니다`);
      continue;
    }
    const model = String(env.AI_MODEL || '').trim() || p.model;
    return { name, label: p.label, model, ...p.create({ model, key: env[p.keyEnv] }) };
  }
  return null;
}

// ---- Claude (Anthropic) ----------------------------------------------------
function anthropic({ model, key }) {
  const client = new Anthropic({ apiKey: key });
  return {
    start({ system, prompt, tools }) {
      const messages = [{ role: 'user', content: prompt }];
      const defs = tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters, eager_input_streaming: true }));
      return {
        async next(onText) {
          for (let attempt = 0; ; attempt++) {
            const stream = client.beta.messages.stream({
              model,
              max_tokens: MAX_TOKENS,
              system,
              tools: defs,
              messages,
              output_config: { effort: 'low' },
              // 안전 분류기가 거절하면 서버가 알맞은 모델로 다시 돌려 준다
              betas: ['server-side-fallback-2026-07-01'],
              fallbacks: 'default',
            });
            stream.on('text', onText);
            let message;
            try {
              message = await stream.finalMessage();
            } catch (err) {
              if (err instanceof Anthropic.APIError || attempt >= 2) throw err;
              continue; // 도구 입력 JSON 을 못 읽은 경우만 다시
            }
            if (message.stop_reason === 'refusal') return { refused: true, calls: [] };
            if (message.stop_reason === 'pause_turn') {
              messages.push({ role: 'assistant', content: message.content });
              continue;
            }
            const calls = message.content.filter((b) => b.type === 'tool_use').map((b) => ({ id: b.id, name: b.name, input: b.input }));
            if (calls.length && message.stop_reason === 'max_tokens') return { truncated: true, calls: [] };
            // 모델의 답 전체(content)를 그대로 넣어야 다음 차례의 tool_result 와 짝이 맞는다
            if (calls.length) messages.push({ role: 'assistant', content: message.content });
            return { calls };
          }
        },
        reply(results) {
          messages.push({
            role: 'user',
            content: results.map((r) => ({ type: 'tool_result', tool_use_id: r.id, content: JSON.stringify(r.output), ...(r.isError ? { is_error: true } : {}) })),
          });
        },
      };
    },
  };
}

// ---- OpenAI (Responses API) -----------------------------------------------
function openai({ model, key }) {
  const client = new OpenAI({ apiKey: key });
  return {
    start({ system, prompt, tools }) {
      let previous = null; // 서버에 저장된 지난 응답. 다음 요청은 새로 생긴 것만 보낸다
      let input = [{ role: 'user', content: prompt }];
      const defs = tools.map((t) => ({ type: 'function', name: t.name, description: t.description, parameters: t.parameters }));
      return {
        async next(onText) {
          const stream = await client.responses.create({
            model,
            instructions: system,
            input,
            tools: defs,
            max_output_tokens: MAX_TOKENS,
            ...(previous ? { previous_response_id: previous } : {}),
            stream: true,
          });
          const calls = [];
          let incomplete = false;
          for await (const ev of stream) {
            if (ev.type === 'response.output_text.delta') onText(ev.delta);
            else if (ev.type === 'response.output_item.done' && ev.item.type === 'function_call') calls.push(ev.item);
            else if (ev.type === 'response.completed') previous = ev.response.id;
            else if (ev.type === 'response.incomplete') {
              incomplete = true;
              previous = ev.response.id;
            } else if (ev.type === 'response.failed' || ev.type === 'error') {
              throw new Error(`OpenAI 응답 실패: ${ev.response?.error?.message || ev.message || ev.type}`);
            }
          }
          if (calls.length && incomplete) return { truncated: true, calls: [] };
          return { calls: calls.map((c) => ({ id: c.call_id, name: c.name, input: parseJson(c.arguments) })) };
        },
        reply(results) {
          input = results.map((r) => ({ type: 'function_call_output', call_id: r.id, output: JSON.stringify(r.output) }));
        },
      };
    },
  };
}

// ---- Gemini (Google Gen AI) -----------------------------------------------
function gemini({ model, key }) {
  const ai = new GoogleGenAI({ apiKey: key });
  return {
    start({ system, prompt, tools }) {
      const contents = [{ role: 'user', parts: [{ text: prompt }] }];
      const config = {
        systemInstruction: system,
        maxOutputTokens: MAX_TOKENS,
        tools: [{ functionDeclarations: tools.map((t) => ({ name: t.name, description: t.description, parametersJsonSchema: t.parameters })) }],
      };
      return {
        async next(onText) {
          const stream = await ai.models.generateContentStream({ model, contents, config });
          const parts = [];
          let finish = '';
          for await (const chunk of stream) {
            const cand = chunk.candidates?.[0];
            if (cand?.finishReason) finish = cand.finishReason;
            for (const part of cand?.content?.parts || []) {
              if (part.text && !part.thought) onText(part.text);
              parts.push(part);
            }
          }
          if (finish === 'SAFETY' || finish === 'PROHIBITED_CONTENT') return { refused: true, calls: [] };
          const calls = parts.filter((p) => p.functionCall).map((p, i) => ({ id: p.functionCall.id || `call-${i}`, name: p.functionCall.name, input: p.functionCall.args || {} }));
          if (calls.length && finish === 'MAX_TOKENS') return { truncated: true, calls: [] };
          // 모델이 낸 부분(parts)을 그대로 돌려줘야 한다. 생각 서명(thoughtSignature)이 여기 붙어 있다
          if (calls.length) contents.push({ role: 'model', parts });
          return { calls };
        },
        reply(results) {
          contents.push({
            role: 'user',
            parts: results.map((r) => ({
              functionResponse: { ...(r.id.startsWith('call-') ? {} : { id: r.id }), name: r.name, response: r.isError ? { error: r.output } : { result: r.output } },
            })),
          });
        },
      };
    },
  };
}

function parseJson(text) {
  try {
    return JSON.parse(text || '{}');
  } catch {
    return null; // validate 에서 걸러진다
  }
}
