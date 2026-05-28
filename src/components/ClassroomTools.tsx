/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  HelpCircle, 
  LayoutGrid, 
  MapPin, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Heart,
  Shuffle, 
  Gift, 
  Calendar,
  Layers,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { Student, TimetableItem, ClassNotice } from "../types";
import { playPopSound, playSuccessSound, playTadaSound } from "../utils/audio";

interface ClassroomToolsProps {
  students: Student[];
  praisePoints: number;
  setPraisePoints: (val: number | ((p: number) => number)) => void;
  timetable: TimetableItem[];
  setTimetable: (t: TimetableItem[]) => void;
  notices: ClassNotice[];
  setNotices: (n: ClassNotice[] | ((prev: ClassNotice[]) => ClassNotice[])) => void;
  isTeacherMode: boolean;
}

export default function ClassroomTools({
  students,
  praisePoints,
  setPraisePoints,
  timetable,
  setTimetable,
  notices,
  setNotices,
  isTeacherMode
}: ClassroomToolsProps) {
  // Navigation tabs for the sub-tools
  const [activeSubTab, setActiveSubTab] = useState<"thermometer" | "lucky_draw" | "timetable" | "seats">("lucky_draw");

  // Praise Settings
  const [targetGoal, setTargetGoal] = useState("🍕 신나는 피자 파티 대소동!");

  // Lucky Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnStudent, setDrawnStudent] = useState<Student | null>(null);
  const [drawPurpose, setDrawPurpose] = useState("오늘의 급식 당번 🍚");

  // Seat Arrangement State
  const [assignedSeats, setAssignedSeats] = useState<Student[]>([...students]);
  const [isShufflingSeats, setIsShufflingSeats] = useState(false);

  // New Notice form state
  const [newNoticeText, setNewNoticeText] = useState("");
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);
  const [aiKeywords, setAiKeywords] = useState("");
  const [isGeneratingAiNotice, setIsGeneratingAiNotice] = useState(false);
  const [aiError, setAiError] = useState("");

  // Quick edit timetable state
  const [editTimetableIdx, setEditTimetableIdx] = useState<number | null>(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectDetails, setEditSubjectDetails] = useState("");

  const playEffect = () => {
    playPopSound();
  };

  // 1. Add/Adjust Praise Points
  const handleAddPraise = (val: number) => {
    setPraisePoints((prev) => {
      const next = Math.min(100, Math.max(0, prev + val));
      if (next >= 100) {
        playTadaSound();
      } else if (val > 0) {
        playSuccessSound();
      } else {
        playPopSound();
      }
      return next;
    });
  };

  // 2. Random Lucky Draw Picker logic
  const triggerLuckyDraw = () => {
    if (students.length === 0) return;
    setIsDrawing(true);
    setDrawnStudent(null);
    playPopSound();

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const randomIdx = Math.floor(Math.random() * students.length);
      setDrawnStudent(students[randomIdx]);
      if (counter % 3 === 0) playPopSound();
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalIdx = Math.floor(Math.random() * students.length);
      setDrawnStudent(students[finalIdx]);
      setIsDrawing(false);
      playTadaSound();
    }, 2000);
  };

  // 3. Shuffle Classroom Seats (Desk mapping structure)
  const shuffleClassroomSeats = () => {
    if (students.length === 0) return;
    setIsShufflingSeats(true);
    playSuccessSound();

    let steps = 0;
    const interval = setInterval(() => {
      steps++;
      // Shuffle students list
      const tempArr = [...students];
      for (let i = tempArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
      }
      setAssignedSeats(tempArr);
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIsShufflingSeats(false);
      playTadaSound();
    }, 1500);
  };

  // 4. Blackboard Notice addition
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;
    const newNotice: ClassNotice = {
      id: "not_" + Date.now(),
      content: newNoticeText.trim(),
      isImportant: newNoticeImportant,
      createdAt: new Date().toISOString()
    };
    setNotices((prev) => [newNotice, ...prev]);
    setNewNoticeText("");
    setNewNoticeImportant(false);
    playSuccessSound();
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    playPopSound();
  };

  const handleGenerateAiNotice = async () => {
    if (!aiKeywords.trim()) {
      setAiError("키워드를 입력해 주세요.");
      return;
    }
    setAiError("");
    setIsGeneratingAiNotice(true);
    try {
      const res = await fetch("/api/generate-notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: aiKeywords }),
      });

      // Vercel / serverless environment safety parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textFallback = await res.text();
        console.error("Non-JSON Response received:", textFallback);
        throw new Error("서버로부터 올바른 JSON 응답을 받지 못했습니다. Vercel 배포 시 Environment Variables(Secrets) 설정에 Gemini_API_Key 또는 GEMINI_API_KEY가 등록되어 있는지 다시 확인해 주세요.");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "알림장 생성에 실패했습니다.");
      }
      setNewNoticeText(data.content || "");
      setAiKeywords("");
      playSuccessSound();
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsGeneratingAiNotice(false);
    }
  };

  // 5. Timetable Edit Trigger
  const handleStartEditTimetable = (idx: number, item: TimetableItem) => {
    setEditTimetableIdx(idx);
    setEditSubjectName(item.subject);
    setEditSubjectDetails(item.details);
  };

  const handleSaveTimetable = (idx: number) => {
    const updated = [...timetable];
    updated[idx] = {
      ...updated[idx],
      subject: editSubjectName,
      details: editSubjectDetails
    };
    setTimetable(updated);
    setEditTimetableIdx(null);
    playSuccessSound();
  };

  return (
    <div className="bg-white rounded-[28px] p-6 shadow-xl border-4 border-pink-300 mt-6 font-sans">
      
      {/* Tools Navbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-pink-100 pb-5 mb-6">
        <div>
          <h3 className="font-extrabold text-slate-950 text-xl md:text-2xl flex items-center gap-1.5">
            <span>🎒 우리 반 놀이터 & 자율 운영방</span>
          </h3>
          <p className="text-slate-600 text-sm md:text-base font-bold mt-1">수얌쌤과 친구들이 매일 활용하는 자율 시간표, 행운 추첨, 칭찬 온도계 공간!</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 bg-pink-50/35 p-2 rounded-2xl border-2 border-pink-100">
          <button
            id="tool-tab-draw"
            onClick={() => { setActiveSubTab("lucky_draw"); playEffect(); }}
            className="px-4 py-2.5 rounded-xl text-sm md:text-base font-black transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: activeSubTab === "lucky_draw" ? "#EC4899" : "transparent",
              color: activeSubTab === "lucky_draw" ? "white" : "#475569"
            }}
          >
            <Gift className="w-4 h-4 text-pink-200" />
            행운의 뽑기 대장 🎁
          </button>

          <button
            id="tool-tab-seats"
            onClick={() => { setActiveSubTab("seats"); playEffect(); }}
            className="px-4 py-2.5 rounded-xl text-sm md:text-base font-black transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: activeSubTab === "seats" ? "#EC4899" : "transparent",
              color: activeSubTab === "seats" ? "white" : "#475569"
            }}
          >
            <Shuffle className="w-4 h-4 text-pink-200" />
            우리반 자리바꾸기 🎲
          </button>

          <button
            id="tool-tab-thermometer"
            onClick={() => { setActiveSubTab("thermometer"); playEffect(); }}
            className="px-4 py-2.5 rounded-xl text-sm md:text-base font-black transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: activeSubTab === "thermometer" ? "#EC4899" : "transparent",
              color: activeSubTab === "thermometer" ? "white" : "#475569"
            }}
          >
            <Flame className="w-4 h-4 text-pink-200" />
            칭찬 온도계 🔥
          </button>

          <button
            id="tool-tab-timetable"
            onClick={() => { setActiveSubTab("timetable"); playEffect(); }}
            className="px-4 py-2.5 rounded-xl text-sm md:text-base font-black transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: activeSubTab === "timetable" ? "#EC4899" : "transparent",
              color: activeSubTab === "timetable" ? "white" : "#475569"
            }}
          >
            <Calendar className="w-4 h-4 text-pink-200" />
            오늘의 알림장 & 시간표 📝
          </button>
        </div>
      </div>

      {/* 2. TAB CONTROLLER LAYOUTS */}
      <div className="relative min-h-[300px]">
        
        {/* TAB 1: LUCKY DRAW RANDOM PICKER */}
        {activeSubTab === "lucky_draw" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="bg-pink-50/50 rounded-2xl p-5 border-2 border-pink-250">
                <h4 className="font-extrabold text-slate-900 text-base md:text-lg mb-1 flex items-center gap-1">
                  <span>🎁 행운의 번호 & 어린이 뽑기 대장</span>
                </h4>
                <p className="text-slate-705 font-bold text-sm leading-relaxed">수얌쌤과 게임을 하거나, 오늘의 발표자나 당번을 정할 때 행운의 뽑기 인형을 돌려 보세요!</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm md:text-base font-black text-slate-850 block">어디에 쓸 뽑기인가요? (당번/발표 제목)</label>
                <input
                  id="draw-purpose-input"
                  type="text"
                  value={drawPurpose}
                  onChange={(e) => setDrawPurpose(e.target.value)}
                  placeholder="예: 오늘의 수학 퀴즈 대표 해결사 ✏️"
                  className="bg-pink-50/15 border-2 border-pink-100 rounded-xl px-4 py-3 text-sm md:text-base text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <button
                id="draw-lucky-btn"
                onClick={triggerLuckyDraw}
                disabled={isDrawing || students.length === 0}
                className="w-full bg-pink-500 hover:bg-pink-600 font-black text-white rounded-2xl py-3.5 md:py-4 shadow-md border-b-4 border-pink-700 active:translate-y-0.5 tracking-wide text-base md:text-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isDrawing ? "행운의 구슬 셔플 중... 🔮" : " 행운 비눗방울 뿜기 Start! ✨"}
              </button>
            </div>

            <div className="md:col-span-7 flex flex-col items-center justify-center p-6 bg-pink-50/15 rounded-[24px] border-4 border-pink-100 relative overflow-hidden min-h-[320px]">
              {/* Outer circle layout */}
              <div className="absolute w-56 h-56 bg-gradient-to-tr from-pink-200/20 to-rose-200/20 rounded-full blur-xl pointer-events-none" />

              <AnimatePresence mode="wait">
                {isDrawing ? (
                  <motion.div
                    key="drawing_wheel"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex flex-col items-center gap-4 text-center z-10"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-rose-300 text-white flex items-center justify-center text-5xl shadow-md animate-spin">
                      🔮
                    </div>
                    <div>
                      <span className="text-xs md:text-sm text-pink-600 font-black tracking-widest block uppercase animate-pulse">인형 셔플 중</span>
                      <p className="text-slate-850 font-black text-2xl mt-1">누가 뽑히게 될까요? 🥁</p>
                    </div>
                  </motion.div>
                ) : drawnStudent ? (
                  <motion.div
                    key="drawn_result"
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex flex-col items-center gap-4 text-center z-10 p-6 bg-white rounded-3xl shadow-lg border-2 border-pink-200 max-w-[360px] w-full"
                  >
                    <div className="bg-pink-50 text-pink-850 font-black px-4.5 py-1.5 rounded-full text-xs md:text-sm border-2 border-pink-150 inline-block">
                      🎯 {drawPurpose || "행운 발표왕 당첨!"}
                    </div>

                    <div className="text-8xl animate-bounce my-2 select-none">
                      {drawnStudent.emoji}
                    </div>

                    <div>
                      <span className="text-sm md:text-base text-slate-500 font-extrabold block font-mono">{drawnStudent.num}번 어린이</span>
                      <h5 className="font-extrabold text-slate-900 text-3xl mt-0.5">{drawnStudent.name}</h5>
                    </div>

                    <p className="text-slate-700 text-sm md:text-base font-extrabold leading-relaxed mt-2 p-1 bg-pink-50 rounded-xl border border-pink-100">
                      당첨된 <strong className="text-pink-600 block text-base md:text-lg font-black">{drawnStudent.name} 친구!</strong> 축하의 큰 박수를 보내주세요! 👏🎈
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="drawn_placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center z-10"
                  >
                    <span className="text-7xl text-pink-300 block mb-3 select-none">🛸</span>
                    <h5 className="text-slate-800 font-black text-base md:text-lg">행운의 바구니가 기다리고 있어요!</h5>
                    <p className="text-slate-600 text-sm mt-1 font-bold">왼쪽 기계 작동 버튼을 누르면 랜덤으로 한 친구가 여기에 등장합니다!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS DESK SEAT SHUFFLER */}
        {activeSubTab === "seats" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFF0F4] p-5 rounded-2xl border-2 border-pink-200">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-1.5">
                  <span>🎲 신나는 우리반 자리 바꾸기</span>
                </h4>
                <p className="text-slate-650 font-bold text-sm md:text-base leading-relaxed mt-0.5">칠판 기준 앞자리부터 4열 6행 구조(총 24개 데스크)로 모둠 자리를 마음껏 섞어보세요!</p>
              </div>

              <button
                id="shuffle-seats-btn"
                onClick={shuffleClassroomSeats}
                disabled={isShufflingSeats || students.length === 0}
                className="bg-pink-500 hover:bg-pink-600 text-white font-black text-sm md:text-base py-3 px-5 shadow-md rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer border-b-4 border-pink-700"
              >
                <Shuffle className="w-4 h-4" />
                {isShufflingSeats ? "자리를 무작위로 섞는 중..." : "자리 무작위 섞기!"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-2">
              {assignedSeats.map((std, idx) => {
                const columnNum = Math.floor(idx / 6) + 1;
                const rowNum = (idx % 6) + 1;

                return (
                  <motion.div
                    layout
                    key={std.id}
                    className="bg-white border-4 border-pink-100 hover:border-pink-350 rounded-2xl p-4.5 text-center shadow-sm relative min-h-[126px]"
                    whileHover={{ y: -2 }}
                  >
                    {/* Seat coordinate badge */}
                    <span className="absolute top-1.5 left-2.5 text-xs font-mono font-bold text-slate-400">
                      {columnNum}-{rowNum}
                    </span>

                    {/* Desk icon */}
                    <div className="text-4xl my-1.5 select-none">{std.emoji}</div>
                    <div className="text-sm md:text-base font-black text-slate-900 leading-tight">{std.name}</div>
                    <div className="text-xs text-slate-500 font-extrabold font-mono mt-1">{std.num}번</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PRAISE THERMOMETER */}
        {activeSubTab === "thermometer" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="bg-[#FFF0F4] rounded-2xl p-5 border-2 border-pink-200">
                <h4 className="font-extrabold text-slate-900 text-base md:text-lg mb-1 flex items-center gap-1">
                  <span>🔥 따뜻한 우리 반 칭찬 온도계</span>
                </h4>
                <p className="text-slate-700 font-bold text-sm leading-relaxed">
                  착한 일(청소 도우미, 고운 말 쓰기, 과제 모두 완성)을 하면 온도가 올라가요. 100°C 목표를 달성하면 보상을 획득해요!
                </p>
              </div>

              {/* Goal Input Details & Custom controls */}
              <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl border-2 border-pink-200">
                <label className="text-sm md:text-base font-black text-slate-800">이번주 우리반 칭찬 목표 보상</label>
                <input
                  id="target-goal-input"
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="예: 우리반 달리기 자유시간 1시간!"
                  disabled={!isTeacherMode}
                  className="bg-pink-50/15 border-2 border-pink-100 disabled:opacity-75 rounded-xl px-4 py-3 text-sm md:text-base font-black text-slate-850 focus:ring-2 focus:ring-pink-300 transition-all"
                />
              </div>

              {/* Adjust Temp (Available for teacher, or kids if enabled) */}
              <div className="flex flex-col gap-2.5 mt-2 bg-white p-4 rounded-2xl border-2 border-pink-200">
                <span className="text-sm md:text-base font-black text-slate-800 block">온도 조절 제어판 (선생님)</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="add-praise-1"
                    onClick={() => handleAddPraise(1)}
                    className="p-3 bg-pink-50 hover:bg-pink-100 text-pink-900 text-sm font-black rounded-xl border-2 border-pink-150 shadow-sm cursor-pointer"
                  >
                    +1°C 칭찬 스티커 👍
                  </button>
                  <button
                    id="add-praise-5"
                    onClick={() => handleAddPraise(5)}
                    className="p-3 bg-pink-50 hover:bg-pink-100 text-pink-900 text-sm font-black rounded-xl border-2 border-pink-150 shadow-sm cursor-pointer"
                  >
                    +5°C 모듬활동 우수 ⭐
                  </button>
                  <button
                    id="add-praise-10"
                    onClick={() => handleAddPraise(10)}
                    className="p-3 bg-pink-500 hover:bg-pink-600 text-white text-sm font-black rounded-xl border-2 border-pink-600 shadow-md cursor-pointer"
                  >
                    +10°C 협동 성공! 🎉
                  </button>
                  <button
                    id="sub-praise-5"
                    onClick={() => handleAddPraise(-5)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-705 text-sm font-black rounded-xl border-2 border-slate-200 shadow-sm cursor-pointer"
                  >
                    -5°C 소란/지각 🧊
                  </button>
                </div>

                <button
                  id="reset-praise-btn"
                  onClick={() => {
                    setPraisePoints(0);
                  }}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-950 text-white font-black text-sm md:text-base py-3 rounded-xl transition cursor-pointer"
                >
                  온도계 초기화 (0도)
                </button>
              </div>
            </div>

            {/* Vertical Interactive Thermometer Display */}
            <div className="md:col-span-8 flex flex-col md:flex-row items-center justify-center gap-10 p-6 bg-pink-50/15 rounded-3xl border-4 border-pink-100 min-h-[320px]">
              
              {/* Thermometer Glass Structure */}
              <div className="flex items-end gap-3 relative h-64 w-32 shrink-0">
                {/* Back Plate */}
                <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-200 rounded-full w-5 mx-auto border border-slate-300" />
                
                {/* Active Red Mercury Liquid Column */}
                <motion.div
                  layout
                  animate={{ height: `${praisePoints}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 10 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3.5 rounded-full bg-gradient-to-t from-pink-500 via-rose-500 to-red-500 pointer-events-none min-h-[16px]"
                />

                {/* Thermometer Bulb Base */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-pink-500 border-2 border-pink-600 rounded-full shadow-inner flex items-center justify-center text-white font-bold text-2xl pointer-events-none z-10">
                  🌡️
                </div>

                {/* Tick Indicators along vertical plate */}
                <div className="absolute left-[54%] top-4 bottom-14 flex flex-col justify-between text-xs font-mono text-slate-600 font-bold ml-5">
                  <span>100°C 🍕</span>
                  <span>80°C</span>
                  <span>60°C 🔥</span>
                  <span>40°C</span>
                  <span>20°C</span>
                  <span>0°C 🧊</span>
                </div>
              </div>

              {/* Status Report Text */}
              <div className="flex-1 bg-white p-6 rounded-2xl border-4 border-pink-150 max-w-sm flex flex-col justify-center">
                <span className="text-xs md:text-sm bg-pink-100 text-pink-900 font-black px-3 py-1.5 rounded-full border-2 border-pink-150 inline-block w-max self-start mb-2 animate-bounce">
                  실시간 온도 데이터 🌡️
                </span>

                <h3 className="text-5xl font-black font-mono text-pink-600 flex items-baseline leading-none mt-2">
                  {praisePoints}
                  <span className="text-2xl font-black ml-1 text-slate-755">°C</span>
                </h3>

                <div className="mt-4 text-slate-755 text-sm md:text-base leading-relaxed font-sans">
                  <p className="font-extrabold text-slate-800 text-sm">이번주 목표 보상:</p>
                  <p className="text-pink-600 font-extrabold text-base md:text-lg mb-2">{targetGoal}</p>
                  
                  {praisePoints >= 100 ? (
                    <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-3 text-xs md:text-sm font-black text-slate-805 text-center animate-pulse">
                      🎉 축하해요! 드디어 100도 도달 완료! 장기 자랑 및 신나는 잔치를 벌여볼까요? 🎁✨
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm font-bold font-sans">
                      달콤한 보상을 받으려면 앞으로 온도를 <strong className="text-pink-600 font-black">{100 - praisePoints}°C</strong> 더 따뜻하게 데워야 해요!
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: CHALKBOARD TIMETABLE & NOTICE NOTIFICATIONS */}
        {activeSubTab === "timetable" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* School Blackboard Timetable */}
            <div className="lg:col-span-7 bg-emerald-950 shadow-2xl text-white font-sans rounded-[28px] p-6 border-[8px] border-amber-800 relative shadow-inner">
              <div className="absolute top-2.5 right-4 text-[9px] font-mono tracking-wider font-extrabold text-[#FFFBEB] opacity-60">
                수얌쌤의 초록 분필 칠판 👩‍🏫
              </div>

              <h4 className="font-black text-amber-200 text-lg mb-4 flex items-center gap-1.5">
                <span>오늘의 시간표 🗓️</span>
              </h4>

              {/* Rows layout */}
              <div className="space-y-2 mb-3">
                {timetable.map((item, idx) => (
                  <div 
                    key={item.period} 
                    className="flex items-center gap-3.5 border-b border-emerald-900 pb-2.5 last:border-b-0 cursor-pointer hover:bg-emerald-900/40 p-1.5 rounded-lg transition"
                    onClick={() => handleStartEditTimetable(idx, item)}
                  >
                    <span className="w-9 h-9 shrink-0 rounded-full bg-emerald-900 flex items-center justify-center font-mono font-black text-amber-200 text-xs border border-emerald-800">
                      {item.period}
                    </span>

                    {editTimetableIdx === idx ? (
                      <div className="flex flex-1 gap-1.5 items-center">
                        <input
                          type="text"
                          value={editSubjectName}
                          onChange={(e) => setEditSubjectName(e.target.value)}
                          className="bg-emerald-900 text-[#FFFBEB] text-xs font-bold border border-emerald-700 rounded p-1 w-20"
                        />
                        <input
                          type="text"
                          value={editSubjectDetails}
                          onChange={(e) => setEditSubjectDetails(e.target.value)}
                          className="bg-emerald-900 text-[#FFFBEB] text-xs font-bold border border-emerald-700 rounded p-1 flex-1"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveTimetable(idx); }}
                          className="bg-pink-500 hover:bg-pink-600 text-white font-black text-[10px] px-2.5 py-1 rounded"
                        >
                          저장
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditTimetableIdx(null); }}
                          className="bg-slate-600 px-2 py-1 rounded text-[10px]"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 text-xs text-amber-200 font-extrabold">{item.subject}</div>
                        <p className="flex-1 text-[11px] text-[#FFFBEB]/70 font-bold truncate">{item.details}</p>
                        {isTeacherMode && (
                          <span className="text-[9px] text-amber-300 opacity-60 hover:opacity-100 shrink-0">수정</span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <span className="text-[9px] text-amber-100 italic block mt-2 text-right opacity-80">
                💡 {isTeacherMode ? "시간표 행을 클릭하시면 교사 모드에서 직접 시간표 내용을 수정할 수 있습니다!" : "교과 시간을 잘 지켜 보람찬 하루를 보냅시다!"}
              </span>
            </div>

            {/* School Bulletins Notices list */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white border-4 border-pink-150 rounded-[24px] p-5 shadow-lg flex-1">
                <h5 className="font-extrabold text-slate-950 text-sm mb-3 flex items-center justify-between">
                  <span>🛎️ 오늘의 알림장</span>
                  <ClipboardList className="w-4 h-4 text-pink-500" />
                </h5>

                {/* Add Notices form (Teacher Mode only) */}
                {isTeacherMode && (
                  <div className="flex flex-col gap-3 mb-4">
                    {/* Gemini integration UI */}
                    <div className="bg-pink-50/50 border-2 border-pink-100 rounded-2xl p-3.5 flex flex-col gap-2 shadow-sm">
                      <span className="text-xs font-black text-pink-700 flex items-center gap-1.5">
                        <span>🪄 수얌쌤의 AI 알림장 쓰기 도우미</span>
                      </span>
                      <p className="text-[10px] text-slate-500 font-extrabold leading-tight">
                        보고 싶은 키워드를 쉼표로 분리하여 입력해 주세요. 제미나이가 다정한 말투로 초안을 대신 써드립니다!
                      </p>
                      <div className="flex gap-2">
                        <input
                          id="ai-keywords-input"
                          type="text"
                          value={aiKeywords}
                          onChange={(e) => setAiKeywords(e.target.value)}
                          placeholder="예: 현장체험학습, 도시락, 운동화"
                          className="flex-1 bg-white border-2 border-pink-100 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-850"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleGenerateAiNotice();
                            }
                          }}
                        />
                        <button
                          type="button"
                          id="ai-generate-notice-btn"
                          onClick={handleGenerateAiNotice}
                          disabled={isGeneratingAiNotice}
                          className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-black text-xs px-3 py-2 rounded-xl border-b-2 border-pink-700 transition cursor-pointer shadow-sm shrink-0"
                        >
                          {isGeneratingAiNotice ? "작성 중..." : "AI 초안 생성 🪄"}
                        </button>
                      </div>
                      {aiError && (
                        <p className="text-[10px] text-red-500 font-black">⚠️ {aiError}</p>
                      )}
                    </div>

                    <form onSubmit={handleAddNotice} className="flex flex-col gap-2 bg-pink-50/15 p-3 rounded-2xl border-2 border-pink-100">
                      <textarea
                        value={newNoticeText}
                        onChange={(e) => setNewNoticeText(e.target.value)}
                        placeholder="전달하고 싶은 알림 내용을 입력하거나 AI 초안을 받아보세요..."
                        rows={2}
                        className="bg-white border-2 border-pink-100 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-pink-300 resize-none text-slate-800"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newNoticeImportant}
                            onChange={(e) => setNewNoticeImportant(e.target.checked)}
                            className="accent-pink-500 w-4 h-4"
                          />
                          <span>중요 🚨</span>
                        </label>
                        <button
                          type="submit"
                          className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-b-2 border-pink-700 transition cursor-pointer shadow-md"
                        >
                          알림 추가 📬
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notices Rows */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {notices.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3 rounded-2xl text-xs border-2 transition flex items-start justify-between gap-2.5 shadow-2xs ${
                        n.isImportant 
                          ? "bg-pink-50 border-pink-300 text-pink-950 font-black" 
                          : "bg-white border-pink-100 text-slate-800 font-bold"
                      }`}
                    >
                      <div className="flex-1 leading-relaxed">
                        {n.isImportant && (
                          <span className="inline-block bg-pink-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full mr-1 animate-pulse mb-1 border border-pink-600">
                            중요!
                          </span>
                        )}
                        <span>{n.content}</span>
                      </div>

                      {isTeacherMode && (
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="text-slate-400 hover:text-red-500 p-0.5 shrink-0"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {notices.length === 0 && (
                    <p className="text-center py-8 text-slate-400 text-xs italic font-semibold">등록된 알림 사항이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
