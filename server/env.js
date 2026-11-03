// .env 파일을 읽어 process.env 에 넣는다. 의존성을 늘리지 않으려고 dotenv 대신 직접 읽는다.
import { readFileSync } from 'node:fs';

export function loadEnv(path) {
  let text = '';
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return;
  }
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
