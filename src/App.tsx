/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Heart, 
  Sparkles, 
  Info,
  Layers,
  Award,
  BookOpen
} from "lucide-react";
import { Student, Task, Submission, TimetableItem, ClassNotice } from "./types";
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_TASKS, 
  DEFAULT_TIMETABLE, 
  DEFAULT_NOTICES 
} from "./data";

// Subcomponents import
import Header from "./components/Header";
import DoneBoard from "./components/DoneBoard";
import ClassroomTools from "./components/ClassroomTools";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(() => {
    // Default to student mode so kids can click, but let's read from localStorage if present
    const saved = localStorage.getItem("suyam_is_teacher");
    return saved ? JSON.parse(saved) : false;
  });

  // 1. Students State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("suyam_students");
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  // 2. Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("suyam_tasks");
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  // 3. Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem("suyam_submissions");
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Praise Points
  const [praisePoints, setPraisePoints] = useState<number>(() => {
    const saved = localStorage.getItem("suyam_praise_points");
    return saved ? JSON.parse(saved) : 65; // Start with encouraging 65 degrees!
  });

  // 5. Timetable State
  const [timetable, setTimetable] = useState<TimetableItem[]>(() => {
    const saved = localStorage.getItem("suyam_timetable");
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;
  });

  // 6. Notices State
  const [notices, setNotices] = useState<ClassNotice[]>(() => {
    const saved = localStorage.getItem("suyam_notices");
    return saved ? JSON.parse(saved) : DEFAULT_NOTICES;
  });

  // Active view tab in main container: "다했어요" vs "놀이터/자율"
  const [activeTab, setActiveTab] = useState<"todo" | "tools">("todo");

  // 7. Class Title State
  const [classTitle, setClassTitle] = useState<string>(() => {
    const saved = localStorage.getItem("suyam_class_title");
    return saved ? saved : "6학년 2반";
  });

  useEffect(() => {
    localStorage.setItem("suyam_class_title", classTitle);
  }, [classTitle]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("suyam_is_teacher", JSON.stringify(isTeacherMode));
  }, [isTeacherMode]);

  useEffect(() => {
    localStorage.setItem("suyam_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("suyam_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("suyam_submissions", JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem("suyam_praise_points", JSON.stringify(praisePoints));
  }, [praisePoints]);

  useEffect(() => {
    localStorage.setItem("suyam_timetable", JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem("suyam_notices", JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Reward handler
  const handlePraiseReward = (pts: number) => {
    setPraisePoints((prev) => Math.min(100, prev + pts));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="mt-4 font-black text-slate-800 text-sm">수얌쌤의 다했어교실 문 여는 중... 🎒✨</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
        
        {/* Top Header Grid */}
        <Header 
          isTeacherMode={isTeacherMode} 
          setIsTeacherMode={setIsTeacherMode} 
          praisePoints={praisePoints}
          classTitle={classTitle}
          setClassTitle={setClassTitle}
        />

        {/* Global Nav Toggles - 다했어요 게시판 vs 학급 놀이터 및 학급 운영도구 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-[28px] border-4 border-orange-100 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl shrink-0">
              ✨
            </div>
            <div>
              <span className="text-xs md:text-sm font-extrabold text-[#F97316] block uppercase tracking-wider leading-none">둥글둥글 {classTitle}</span>
              <p className="text-slate-900 text-sm md:text-base font-black mt-0.5">원하는 게시판 탭을 선택하세요!</p>
            </div>
          </div>

          <div className="flex bg-[#FFFBEB] p-2 rounded-2xl border-2 border-orange-100 gap-1">
            <button
              id="main-tab-todo"
              onClick={() => setActiveTab("todo")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm sm:text-base font-black transition-all duration-300 cursor-pointer ${
                activeTab === "todo"
                  ? "bg-orange-500 text-white shadow-md scale-102"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Award className="w-5 h-5 text-orange-200" />
              다했어요 게시판 📬
            </button>
            <button
              id="main-tab-tools"
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm sm:text-base font-black transition-all duration-300 cursor-pointer ${
                activeTab === "tools"
                  ? "bg-orange-500 text-white shadow-md scale-102"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-5 h-5 text-orange-200" />
              학급 놀이터 & 자율 운영 🎲
            </button>
          </div>
        </div>

        {/* Dynamic Board Transition Container Component */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative"
        >
          {activeTab === "todo" ? (
            <DoneBoard
              students={students}
              setStudents={setStudents}
              tasks={tasks}
              setTasks={setTasks}
              submissions={submissions}
              setSubmissions={setSubmissions}
              isTeacherMode={isTeacherMode}
              onPraiseReward={handlePraiseReward}
            />
          ) : (
            <ClassroomTools
              students={students}
              praisePoints={praisePoints}
              setPraisePoints={setPraisePoints}
              timetable={timetable}
              setTimetable={setTimetable}
              notices={notices}
              setNotices={setNotices}
              isTeacherMode={isTeacherMode}
            />
          )}
        </motion.div>

        {/* Cute Classroom Information / Tip Cards Banner */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-4 border-orange-100 p-5 rounded-[24px] shadow-md flex items-start gap-3">
            <span className="text-2xl mt-0.5 select-none">🎈</span>
            <div>
              <h5 className="font-extrabold text-slate-900 text-sm">수얌쌤의 팁! 💡</h5>
              <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed font-medium">
                '선생님 모드' 켜기를 누르시면 새로운 검사 제목(예: 독서공책 검사 등)을 직접 타이핑하여 우편함 항목을 무한으로 추가하고 삭제할 수 있어요.
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-yellow-300/50 p-5 rounded-[24px] shadow-md flex items-start gap-3">
            <span className="text-2xl mt-0.5 select-none">🎒</span>
            <div>
              <h5 className="font-extrabold text-slate-900 text-sm">어린이들의 사용법! 🌟</h5>
              <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed font-medium">
                아침에 등교해 숙제를 냈나요? 자기 번호와 이름이 담긴 귀여운 이모티콘을 살포시 누르면 즉시 초록색 완료 도장이 찍혀요!
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-orange-100 p-5 rounded-[24px] shadow-md flex items-start gap-3">
            <span className="text-2xl mt-0.5 select-none font-sans">🎨</span>
            <div>
              <h5 className="font-extrabold text-slate-900 text-sm">우리반 맞춤 명단 설정 🛠️</h5>
              <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed font-medium">
                교사 모드를 활성화한 뒤 '학생 편집방' 버튼을 누르면, 우리반 어린이들의 이름과 전용 이모티콘을 모두 수정하거나 추가할 수 있어요.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info brand */}
        <footer className="mt-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1 text-slate-500 font-extrabold">
            <span>수얌쌤과 함께하는 다했어 교실</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
            <span>{classTitle} 사랑방</span>
          </div>
          <p className="text-[10px] text-slate-400">
            © 2026 수얌쌤의 맞춤형 학급운영 보드. Designed for happy, responsive classrooms.
          </p>
        </footer>

      </div>
    </div>
  );
}
