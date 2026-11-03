// 실습용 가상 데이터. 학번, 시간표, 정원은 모두 지어낸 값이다. 담당교수는 매뉴얼처럼 *** 로 가린다.

export const SEMESTER = '2026학년도 1학기';
export const MAX_CREDITS = 22;

export const STUDENTS = [
  { id: '2025320101', name: '조영환', college: '정보대학', dept: '컴퓨터학과', year: 2, wish: ['COSE341-01', 'COSE361-00', 'COSE213-01'] },
  { id: '2024320202', name: '윤가빈', college: '정보대학', dept: '컴퓨터학과', year: 3, wish: ['COSE474-00', 'COSE342-01', 'GEKS001-12'] },
  { id: '2023380303', name: '오동', college: '정보대학', dept: '데이터과학과', year: 4, wish: ['COSE371-00', 'COSE489-00', 'PEGA110-02'] },
];

// 교시: 1~6 교시 75분, 7교시부터 저녁. 미니 시간표는 0~15 교시를 그린다
export const PERIODS = {
  0: '08:00', 1: '09:00', 2: '10:30', 3: '12:00', 4: '13:30', 5: '15:00', 6: '16:30',
  7: '18:00', 8: '19:00', 9: '20:00', 10: '21:00',
};

// times: [[요일, 교시, ...]]  pop: 가상 학생이 몰리는 정도 (0~5)
export const COURSES = [
  { code: 'COSE101', section: '02', type: '전공필수', name: '컴퓨터프로그래밍I', credits: 3, times: [['월', 1], ['수', 1]], room: '정보관 202호', cap: 60, pop: 2 },
  { code: 'COSE212', section: '00', type: '전공선택', name: '프로그래밍언어', credits: 3, times: [['월', 2], ['수', 2]], room: '정보관 204호', cap: 60, pop: 1 },
  { code: 'COSE213', section: '01', type: '전공필수', name: '자료구조', credits: 3, times: [['월', 3], ['수', 3]], room: '정보관 202호', cap: 70, pop: 4 },
  { code: 'COSE213', section: '02', type: '전공필수', name: '자료구조', credits: 3, times: [['화', 3], ['목', 3]], room: '과학도서관 501호', cap: 70, pop: 4 },
  { code: 'COSE222', section: '01', type: '전공필수', name: '컴퓨터구조', credits: 3, times: [['화', 2], ['목', 2]], room: '정보관 B101호', cap: 60, pop: 2 },
  { code: 'COSE341', section: '01', type: '전공필수', name: '운영체제', credits: 3, times: [['월', 4], ['수', 4]], room: '정보관 202호', cap: 50, pop: 5 },
  { code: 'COSE341', section: '02', type: '전공필수', name: '운영체제', credits: 3, times: [['화', 5], ['목', 5]], room: '하나스퀘어 B110호', cap: 50, pop: 5 },
  { code: 'COSE342', section: '01', type: '전공선택', name: '컴퓨터네트워크', credits: 3, times: [['화', 4], ['목', 4]], room: '정보관 204호', cap: 50, pop: 3 },
  { code: 'COSE361', section: '00', type: '전공선택', name: '인공지능', credits: 3, times: [['월', 5], ['수', 5]], room: '하나스퀘어 B101호', cap: 80, pop: 5 },
  { code: 'COSE371', section: '00', type: '전공필수', name: '데이터베이스', credits: 3, times: [['화', 1], ['목', 1]], room: '정보관 202호', cap: 70, pop: 3 },
  { code: 'COSE474', section: '00', type: '전공선택', name: '딥러닝', credits: 3, times: [['금', 2], ['금', 3]], room: '하나스퀘어 B101호', cap: 40, pop: 5 },
  { code: 'COSE489', section: '00', type: '전공선택', name: '캡스톤디자인', credits: 3, times: [['금', 5], ['금', 6]], room: '정보관 B102호', cap: 30, pop: 1 },
  { code: 'GEKS001', section: '12', type: '교양', name: '글쓰기', credits: 2, times: [['화', 6], ['목', 6]], room: '국제관 314호', cap: 25, pop: 3 },
  { code: 'GEKS010', section: '03', type: '교양', name: 'Academic English', credits: 2, times: [['월', 6], ['수', 6]], room: '국제관 211호', cap: 25, pop: 2 },
  { code: 'GECT110', section: '00', type: '교양', name: '인공지능과 미래사회', credits: 3, times: [['금', 4]], room: '인촌기념관 강당', cap: 150, pop: 3 },
  { code: 'GEST401', section: '00', type: '교양', name: '창업과 혁신', credits: 2, times: [['수', 7], ['수', 8]], room: '경영본관 B201호', cap: 80, pop: 2 },
  { code: 'PEGA110', section: '02', type: '교양', name: '테니스', credits: 1, times: [['목', 7], ['목', 8]], room: '화정체육관', cap: 20, pop: 5 },
  { code: 'KECO101', section: '01', type: '학문의기초', name: '경제학원론', credits: 3, times: [['월', 1], ['수', 1]], room: '정경관 201호', cap: 100, pop: 1 },
].map((c) => ({ ...c, key: `${c.code}-${c.section}`, prof: '***', hours: c.credits }));

export const COURSE_BY_KEY = new Map(COURSES.map((c) => [c.key, c]));

export function timeLabel(course) {
  const byDay = new Map();
  for (const [day, p] of course.times) byDay.set(day, [...(byDay.get(day) || []), p]);
  return [...byDay].map(([day, ps]) => `${day}(${ps.length > 1 ? `${ps[0]}-${ps[ps.length - 1]}` : ps[0]}) ${course.room}`);
}
