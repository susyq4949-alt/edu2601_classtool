/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, UserCheck, Shield, Sparkles, BookOpen } from "lucide-react";

interface HeaderProps {
  isTeacherMode: boolean;
  setIsTeacherMode: (val: boolean) => void;
  praisePoints: number;
  classTitle: string;
  setClassTitle: (val: string) => void;
}

export default function Header({ isTeacherMode, setIsTeacherMode, praisePoints, classTitle, setClassTitle }: HeaderProps) {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [greetingIndex, setGreetingIndex] = useState(0);

  const greetings = [
    "오늘도 신나게 배우고 자라나요! 🌱",
    "친구들의 이모티콘을 누르면 '다했어요!' 체크가 돼요! 🌟",
    "다했어요 게시판에서 오늘의 미션을 확인해 봐요! 🎒",
    "수얌쌤이 우리반 모두를 응원하고 있어요! 👩‍🏫💖",
  ];

  useEffect(() => {
    // Show current local time realistically
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
      setDateStr(now.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const greetingTimer = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 6000);
    return () => clearInterval(greetingTimer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-white rounded-[32px] p-6 md:p-8 shadow-xl border-4 border-pink-300 mb-6 font-sans">
      {/* Cloud style backgrounds */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-pink-50/50 rounded-full blur-2xl -mr-10 -mt-10" />
      <div className="absolute -bottom-8 left-10 w-44 h-44 bg-rose-100/30 rounded-full blur-3xl" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Title and Avatar */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-14 h-14 bg-pink-400 rounded-full flex items-center justify-center shadow-md shrink-0 text-3xl"
          >
            ✨
          </motion.div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isTeacherMode ? (
                <div className="bg-pink-50 text-pink-700 text-xs md:text-sm font-bold px-3.5 py-1.5 rounded-full border border-pink-200 flex items-center gap-1.5 animate-pulse">
                  <span className="text-xs md:text-sm font-extrabold">🏫 학급명:</span>
                  <input
                    id="class-title-input"
                    type="text"
                    value={classTitle}
                    onChange={(e) => setClassTitle(e.target.value)}
                    placeholder="6학년 2반"
                    className="bg-white border border-pink-200 rounded px-2 py-0.5 text-xs md:text-sm w-28 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <span className="text-xs text-pink-400">✏️</span>
                </div>
              ) : (
                <span className="bg-pink-50 text-pink-700 text-xs md:text-sm font-bold px-3.5 py-1.5 rounded-full border border-pink-200">
                  수얌쌤의 둥글둥글 {classTitle} 🌱
                </span>
              )}
              <span className="bg-pink-100/50 text-pink-800 text-xs md:text-sm font-bold px-3.5 py-1.5 rounded-full border border-pink-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                온도계: {praisePoints}°C
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight mt-1">
              <span className="text-pink-550 text-pink-600">수얌쌤</span>의 다했어교실 🎉
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-0.5 h-6 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={greetingIndex}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  className="font-black text-pink-600"
                >
                  {greetings[greetingIndex]}
                </motion.span>
              </AnimatePresence>
            </p>
          </div>
        </div>

        {/* Date / Time and Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-pink-50/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-pink-250 shadow-xs flex items-center justify-center gap-3 font-bold text-slate-800">
            <Calendar className="w-4.5 h-4.5 text-pink-500" />
            <span className="text-slate-700 text-sm md:text-base font-extrabold">{dateStr}</span>
            <span className="w-2 h-2 bg-pink-450 rounded-full animate-ping" />
            <span className="font-black font-mono text-base text-slate-850">{timeStr}</span>
          </div>

          {/* Teacher/Student Mode toggle buttons */}
          <div className="bg-pink-50 border border-pink-200 p-1 rounded-2xl flex shadow-xs">
            <button
              id="student_mode_btn"
              onClick={() => setIsTeacherMode(false)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm md:text-base transition-all duration-300 font-black ${
                !isTeacherMode
                  ? "bg-white text-pink-600 shadow-md"
                  : "text-slate-600 hover:text-slate-850 hover:bg-white/40"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              학생 모드 🎒
            </button>
            <button
              id="teacher_mode_btn"
              onClick={() => setIsTeacherMode(true)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm md:text-base transition-all duration-300 font-black ${
                isTeacherMode
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-850 hover:bg-white/40"
              }`}
            >
              <Shield className="w-4 h-4" />
              교사 모드 🔑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
