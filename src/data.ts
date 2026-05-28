/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Task, TimetableItem, ClassNotice } from "./types";

export const DEFAULT_STUDENTS: Student[] = [
  { id: "s1", num: 1, name: "강민준", emoji: "🦊" },
  { id: "s2", num: 2, name: "김서연", emoji: "🐰" },
  { id: "s3", num: 3, name: "이도윤", emoji: "🐯" },
  { id: "s4", num: 4, name: "박하은", emoji: "🐼" },
  { id: "s5", num: 5, name: "최지우", emoji: "🐨" },
  { id: "s6", num: 6, name: "정예준", emoji: "🦁" },
  { id: "s7", num: 7, name: "강지원", emoji: "🐱" },
  { id: "s8", num: 8, name: "조민서", emoji: "🐶" },
  { id: "s9", num: 9, name: "윤수빈", emoji: "🐷" },
  { id: "s10", num: 10, name: "임주원", emoji: "🐸" },
  { id: "s11", num: 11, name: "한지유", emoji: "🐿️" },
  { id: "s12", num: 12, name: "오준서", emoji: "🐧" },
  { id: "s13", num: 13, name: "서다은", emoji: "🐦" },
  { id: "s14", num: 14, name: "신우진", emoji: "🐥" },
  { id: "s15", num: 15, name: "권채원", emoji: "🦄" },
  { id: "s16", num: 16, name: "황선우", emoji: "🐝" },
  { id: "s17", num: 17, name: "안서현", emoji: "🐳" },
  { id: "s18", num: 18, name: "송유진", emoji: "🐙" },
  { id: "s19", num: 19, name: "전시우", emoji: "🦖" },
  { id: "s20", num: 20, name: "고수아", emoji: "🦋" },
  { id: "s21", num: 21, name: "양지호", emoji: "🦥" },
  { id: "s22", num: 22, name: "손윤아", emoji: "🐑" },
  { id: "s23", num: 23, name: "유다인", emoji: "🦔" },
  { id: "s24", num: 24, name: "백태양", emoji: "🐹" }
];

export const DEFAULT_TASKS: Task[] = [
  { id: "t1", title: "가정통신문 회수 📬", createdAt: "2026-05-27T09:00:00Z" },
  { id: "t2", title: "수학익힘책 42-45쪽 📐", createdAt: "2026-05-27T10:00:00Z" },
  { id: "t3", title: "글쓰기공책 검사 📝", createdAt: "2026-05-27T11:00:00Z" }
];

export const DEFAULT_TIMETABLE: TimetableItem[] = [
  { period: 1, subject: "국어 📖", details: "나의 생각 쓰기 및 낭독 시간" },
  { period: 2, subject: "수학 📐", details: "덧셈과 뺄셈 카드 대결 놀이" },
  { period: 3, subject: "체육 ⚽", details: "강당에서 점프 컵쌓기 피구" },
  { period: 4, subject: "미술 🎨", details: "나만의 이모티콘 얼굴 그리기" },
  { period: 5, subject: "과학 🧪", details: "액체 물감으로 무지개 탑 쌓기" },
  { period: 6, subject: "창체 🌟", details: "모듬별 우리반 규칙 퀴즈 대우" }
];

export const DEFAULT_NOTICES: ClassNotice[] = [
  { id: "n1", content: "👟 내일은 체육 수업이 있으니 체육복과 운동화를 꼭 신어 오세요!", isImportant: true, createdAt: "2026-05-27T14:00:00Z" },
  { id: "n2", content: "📝 받아쓰기 5급 연습 3번씩 공책에 써 오기", isImportant: false, createdAt: "2026-05-27T14:10:00Z" },
  { id: "n3", content: "📬 서명이 필요한 가정통신문(우유급식 동의서) 내일까지 꼭 제출해 주세요!", isImportant: true, createdAt: "2026-05-27T14:20:00Z" }
];

export const EMOJI_POOL = [
  "🦊", "🐰", "🐯", "🐼", "🐨", "🦁", "🐱", "🐶", "🐷", "🐸",
  "🐿️", "🐧", "🐦", "🐥", "🦄", "🐝", "🐳", "🐙", "🦖", "🦋",
  "🦥", "🐑", "🦔", "🐹", "🐒", "🐘", "🦕", "🦞", "🦉", "🐞",
  "🐬", "🌻", "🍎", "🎈", "⭐", "🍀", "🌈", "🔥", "🚀", "🍦"
];
