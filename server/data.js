// 과목은 2026학년도 2학기 실제 개설 과목(수강신청 사이트의 공개 과목조회)에서 학수번호, 분반, 과목명, 이수구분, 학점,
// 시간, 강의실을 옮겼다. 정원(cap), 인기도(pop), 학생과 학번은 지어낸 값이다. 담당교수는 매뉴얼처럼 *** 로 가린다.

export const SEMESTER = '2026학년도 2학기';
export const MAX_CREDITS = 22;

export const STUDENTS = [
  { id: '2025320101', name: '조영환', college: '정보대학', dept: '컴퓨터학과', year: 2, wish: ['COSE341-01', 'COSE361-02', 'COSE213-01'] },
  { id: '2024320202', name: '윤가빈', college: '정보대학', dept: '컴퓨터학과', year: 3, wish: ['COSE474-01', 'COSE342-01', 'GEQR067-00'] },
  { id: '2023380303', name: '오동', college: '정보대학', dept: '데이터과학과', year: 4, wish: ['COSE371-00', 'COSE471-00', 'COSE490-00'] },
];

// 교시: 1~6 교시 75분, 7교시부터 저녁. 미니 시간표는 0~15 교시를 그린다
export const PERIODS = {
  0: '08:00', 1: '09:00', 2: '10:30', 3: '12:00', 4: '13:30', 5: '15:00', 6: '16:30',
  7: '18:00', 8: '19:00', 9: '20:00', 10: '21:00',
};

// times: [[요일, 교시, ...]]  pop: 가상 학생이 몰리는 정도 (0~5)
export const COURSES = [
  { code: 'COSE101', section: '00', type: '학문의기초', name: '컴퓨터프로그래밍I', credits: 3, times: [['화', 1], ['화', 2]], room: '정보통신관 B101호', cap: 60, pop: 0 },
  { code: 'COSE102', section: '02', type: '학문의기초', name: '컴퓨터프로그래밍II', credits: 3, times: [['화', 3], ['화', 4]], room: '정보통신관 B101호', cap: 60, pop: 1 },
  { code: 'COSE111', section: '02', type: '학문의기초', name: '전산수학I', credits: 3, times: [['금', 2], ['금', 3]], room: '정보통신관 604호', cap: 60, pop: 0 },
  { code: 'COSE112', section: '04', type: '학문의기초', name: '전산수학II', credits: 3, times: [['월', 2], ['수', 2]], room: '정보통신관 604호', cap: 60, pop: 0 },
  { code: 'COSE211', section: '01', type: '전공선택', name: '이산수학(영강)', credits: 3, times: [['화', 6], ['목', 6]], room: '정보통신관 B101호', cap: 60, pop: 1 },
  { code: 'COSE211', section: '02', type: '전공선택', name: '이산수학(영강)', credits: 3, times: [['월', 5], ['수', 5]], room: '정보통신관 B101호', cap: 60, pop: 1 },
  { code: 'COSE211', section: '03', type: '전공선택', name: '이산수학', credits: 3, times: [['금', 4], ['금', 5]], room: '정보통신관 604호', cap: 50, pop: 1 },
  { code: 'COSE212', section: '01', type: '전공선택', name: '프로그래밍언어', credits: 3, times: [['화', 2], ['화', 3], ['목', 2], ['목', 3]], room: '정운오IT교양관 B103호', cap: 60, pop: 1 },
  { code: 'COSE212', section: '02', type: '전공선택', name: '프로그래밍언어(영강)', credits: 3, times: [['월', 4], ['수', 4]], room: '정운오IT교양관 610호', cap: 50, pop: 1 },
  { code: 'COSE213', section: '01', type: '전공필수', name: '자료구조(영강)', credits: 3, times: [['화', 5], ['목', 5]], room: '정보통신관 604호', cap: 60, pop: 2 },
  { code: 'COSE213', section: '02', type: '전공필수', name: '자료구조', credits: 3, times: [['월', 3], ['수', 3]], room: '아산이학관 113호', cap: 70, pop: 2 },
  { code: 'COSE213', section: '03', type: '전공필수', name: '자료구조', credits: 3, times: [['수', 5], ['금', 5]], room: '정운오IT교양관 609호', cap: 60, pop: 2 },
  { code: 'COSE214', section: '01', type: '전공필수', name: '알고리즘(영강)', credits: 3, times: [['월', 6], ['수', 6]], room: '정보통신관 B101호', cap: 60, pop: 2 },
  { code: 'COSE214', section: '02', type: '전공필수', name: '알고리즘(영강)', credits: 3, times: [['화', 7], ['화', 8], ['목', 7], ['목', 8]], room: '정보통신관 B101호', cap: 60, pop: 1 },
  { code: 'COSE214', section: '04', type: '전공필수', name: '알고리즘', credits: 3, times: [['수', 3], ['수', 4]], room: '정운오IT교양관 611호', cap: 50, pop: 2 },
  { code: 'COSE215', section: '00', type: '전공선택', name: '계산이론(영강)', credits: 3, times: [['화', 4], ['목', 4]], room: '정운오IT교양관 B102', cap: 50, pop: 1 },
  { code: 'COSE221', section: '00', type: '전공선택', name: '논리설계', credits: 3, times: [['화', 1], ['목', 1]], room: '애기능생활관 301호', cap: 60, pop: 0 },
  { code: 'COSE222', section: '01', type: '전공필수', name: '컴퓨터구조(영강)', credits: 3, times: [['화', 4], ['목', 4]], room: '애기능생활관 301호', cap: 60, pop: 2 },
  { code: 'COSE222', section: '02', type: '전공필수', name: '컴퓨터구조(영강)', credits: 3, times: [['월', 5], ['수', 5]], room: '애기능생활관 301호', cap: 60, pop: 2 },
  { code: 'COSE242', section: '01', type: '전공선택', name: '데이터통신', credits: 3, times: [['월', 4], ['수', 4]], room: '정보통신관 604호', cap: 50, pop: 1 },
  { code: 'COSE281', section: '02', type: '전공선택', name: '공학수학', credits: 3, times: [['월', 5], ['수', 5]], room: '정운오IT교양관 611호', cap: 50, pop: 1 },
  { code: 'COSE341', section: '01', type: '전공필수', name: '운영체제(영강)', credits: 3, times: [['월', 3], ['수', 3]], room: '아산이학관 535호', cap: 50, pop: 2 },
  { code: 'COSE341', section: '02', type: '전공필수', name: '운영체제', credits: 3, times: [['월', 4], ['수', 4]], room: '정보통신관 205호', cap: 12, pop: 5 },
  { code: 'COSE342', section: '01', type: '전공필수', name: '컴퓨터네트워크', credits: 3, times: [['화', 4], ['목', 4]], room: '정운오IT교양관 609호', cap: 50, pop: 2 },
  { code: 'COSE342', section: '02', type: '전공필수', name: '컴퓨터네트워크', credits: 3, times: [['화', 5], ['목', 5]], room: '아산이학관 535호', cap: 50, pop: 2 },
  { code: 'COSE352', section: '01', type: '전공선택', name: '소프트웨어공학', credits: 3, times: [['월', 2], ['수', 2]], room: '정보통신관 205호', cap: 50, pop: 1 },
  { code: 'COSE352', section: '02', type: '전공선택', name: '소프트웨어공학(영강)', credits: 3, times: [['화', 3], ['화', 4], ['목', 3], ['목', 4]], room: '정보통신관 604호', cap: 50, pop: 1 },
  { code: 'COSE354', section: '01', type: '전공선택', name: '정보보호(영강)', credits: 3, times: [['화', 5], ['목', 5]], room: '정운오IT교양관 B102', cap: 50, pop: 1 },
  { code: 'COSE354', section: '02', type: '전공선택', name: '정보보호(영강)', credits: 3, times: [['화', 1], ['화', 2], ['목', 1], ['목', 2]], room: '애기능생활관 302호', cap: 50, pop: 0 },
  { code: 'COSE361', section: '01', type: '전공필수', name: '인공지능(영강)', credits: 3, times: [['월', 2], ['월', 3], ['수', 2], ['수', 3]], room: '정운오IT교양관 B102', cap: 60, pop: 2 },
  { code: 'COSE361', section: '02', type: '전공필수', name: '인공지능(영강)', credits: 3, times: [['화', 4], ['목', 4]], room: '정운오IT교양관 611호', cap: 50, pop: 2 },
  { code: 'COSE361', section: '03', type: '전공필수', name: '인공지능(영강)', credits: 3, times: [['화', 3], ['목', 3]], room: '애기능생활관 301호', cap: 12, pop: 5 },
  { code: 'COSE362', section: '01', type: '전공선택', name: '기계학습', credits: 3, times: [['화', 5], ['목', 5]], room: '애기능생활관 301호', cap: 60, pop: 2 },
  { code: 'COSE362', section: '02', type: '전공선택', name: '기계학습', credits: 3, times: [['월', 1], ['수', 1]], room: '정보통신관 B101호', cap: 60, pop: 1 },
  { code: 'COSE371', section: '00', type: '전공선택', name: '데이터베이스(영강)', credits: 3, times: [['월', 4], ['수', 4]], room: '정운오IT교양관 B102', cap: 70, pop: 2 },
  { code: 'COSE372', section: '00', type: '전공선택', name: '데이터베이스시스템', credits: 3, times: [['화', 2], ['목', 2]], room: '정운오IT교양관 611호', cap: 50, pop: 1 },
  { code: 'COSE382', section: '01', type: '전공선택', name: '확률및랜덤과정', credits: 3, times: [['화', 2], ['목', 2]], room: '정운오IT교양관 B102', cap: 50, pop: 1 },
  { code: 'COSE389', section: '00', type: '전공선택', name: '기업가정신과리더쉽', credits: 3, times: [['수', 4], ['금', 4]], room: '애기능생활관 301호', cap: 60, pop: 1 },
  { code: 'COSE444', section: '00', type: '전공선택', name: '클라우드컴퓨팅', credits: 3, times: [['월', 2], ['수', 2]], room: '애기능생활관 302호', cap: 50, pop: 2 },
  { code: 'COSE451', section: '00', type: '전공선택', name: '소프트웨어보안', credits: 3, times: [['화', 2], ['목', 2]], room: '정보통신관 604호', cap: 50, pop: 1 },
  { code: 'COSE455', section: '00', type: '전공선택', name: '스타트업프로젝트관리', credits: 3, times: [['수', 3], ['금', 3]], room: '애기능생활관 301호', cap: 40, pop: 1 },
  { code: 'COSE471', section: '00', type: '전공선택', name: '데이터과학', credits: 3, times: [['화', 3], ['화', 4], ['목', 3], ['목', 4]], room: '정보통신관 205호', cap: 50, pop: 2 },
  { code: 'COSE474', section: '01', type: '전공선택', name: '딥러닝', credits: 3, times: [['월', 4], ['월', 5], ['수', 4], ['수', 5]], room: '정운오IT교양관 B103호', cap: 60, pop: 2 },
  { code: 'COSE474', section: '02', type: '전공선택', name: '딥러닝', credits: 3, times: [['금', 3], ['금', 4]], room: '정운오IT교양관 B102', cap: 10, pop: 5 },
  { code: 'COSE490', section: '00', type: '전공선택', name: '전산학특강(영강)', credits: 3, times: [['금', 3], ['금', 4]], room: '정보통신관 B101호', cap: 40, pop: 0 },
  { code: 'GEQR067', section: '00', type: '교양', name: '하이퍼텍스트와계산가능성', credits: 3, times: [['화', 3], ['목', 3]], room: '교양관 104호', cap: 80, pop: 1 },
  { code: 'GEQR088', section: '00', type: '교양', name: '디지털사유와정치경제', credits: 3, times: [['월', 3], ['수', 3]], room: '교양관 209호', cap: 80, pop: 1 },
  { code: 'GEQR090', section: '00', type: '교양', name: '디지털인문학을위한데이터처리와분석', credits: 3, times: [['월', 5], ['수', 5]], room: '교양관 210호', cap: 80, pop: 1 },
  { code: 'GEQR092', section: '00', type: '교양', name: '웹툰,한류,그리고미래콘텐츠', credits: 3, times: [['화', 3], ['목', 3]], room: '교양관 602호', cap: 12, pop: 5 },
].map((c) => ({ ...c, key: `${c.code}-${c.section}`, prof: '***', hours: c.credits }));

export const COURSE_BY_KEY = new Map(COURSES.map((c) => [c.key, c]));

export function timeLabel(course) {
  const byDay = new Map();
  for (const [day, p] of course.times) byDay.set(day, [...(byDay.get(day) || []), p]);
  return [...byDay].map(([day, ps]) => `${day}(${ps.length > 1 ? `${ps[0]}-${ps[ps.length - 1]}` : ps[0]}) ${course.room}`);
}
