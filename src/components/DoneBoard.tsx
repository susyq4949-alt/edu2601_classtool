/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Users, 
  XCircle, 
  Check, 
  PartyPopper,
  Volume2, 
  Edit3, 
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import { Student, Task, Submission } from "../types";
import { playPopSound, playSuccessSound, playTadaSound, playApplauseSound } from "../utils/audio";
import { EMOJI_POOL } from "../data";

interface DoneBoardProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  submissions: Submission[];
  setSubmissions: (submissions: Submission[] | ((prev: Submission[]) => Submission[])) => void;
  isTeacherMode: boolean;
  onPraiseReward: (pts: number) => void;
}

export default function DoneBoard({
  students,
  setStudents,
  tasks,
  setTasks,
  submissions,
  setSubmissions,
  isTeacherMode,
  onPraiseReward
}: DoneBoardProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || "");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  
  // Student editor form fields
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editNum, setEditNum] = useState<number>(1);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmoji, setNewStudentEmoji] = useState("🦊");
  const [newStudentNum, setNewStudentNum] = useState<number>(students.length + 1);

  // Audio helper toggler
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Non-blocking toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Confirm state trackers for non-blocking iframe safety
  const [confirmResetTaskId, setConfirmResetTaskId] = useState<string | null>(null);
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Derive submissions for the selected task
  const currentSubmissions = submissions.filter((s) => s.taskId === selectedTaskId);
  
  // Quick lookup of submitted status
  const isStudentSubmitted = (studentId: string) => {
    return currentSubmissions.find((s) => s.studentId === studentId)?.submitted || false;
  };

  const toggleStudentSubmission = (studentId: string) => {
    if (!selectedTaskId) return;
    
    // Toggle state
    setSubmissions((prev) => {
      const existingIdx = prev.findIndex((s) => s.taskId === selectedTaskId && s.studentId === studentId);
      let updated = [...prev];
      let willBeSubmitted = true;
      
      if (existingIdx > -1) {
        willBeSubmitted = !prev[existingIdx].submitted;
        updated[existingIdx] = {
          ...prev[existingIdx],
          submitted: willBeSubmitted
        };
      } else {
        updated.push({ taskId: selectedTaskId, studentId, submitted: true });
      }

      // Play cute synthesised audio feedback
      if (soundEnabled) {
        if (willBeSubmitted) {
          playPopSound();
        } else {
          // Subtle pitch change or shorter click
          playPopSound();
        }
      }

      // Check if this submission completes the task for 100% of the class!
      const activeTaskSubs = updated.filter(u => u.taskId === selectedTaskId && u.submitted);
      if (activeTaskSubs.length === students.length && willBeSubmitted) {
        // Play grand tada sound and applause sound, and trigger celebration!
        setTimeout(() => {
          if (soundEnabled) {
            playTadaSound();
            playApplauseSound();
          }
          onPraiseReward(10); // Reward praise temperature
        }, 300);
      }

      return updated;
    });
  };

  // Stats calculation
  const totalStudentsCount = students.length;
  const submittedCount = students.filter((st) => isStudentSubmitted(st.id)).length;
  const unsubmittedCount = totalStudentsCount - submittedCount;
  const submissionPercent = totalStudentsCount > 0 ? Math.round((submittedCount / totalStudentsCount) * 100) : 0;

  // Add a new inspection task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newId = "t_" + Date.now();
    const newTask: Task = {
      id: newId,
      title: newTaskTitle.trim(),
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setSelectedTaskId(newId);
    setNewTaskTitle("");
    if (soundEnabled) playSuccessSound();
  };

  // Delete a task
  const handleDeleteTask = (id: string) => {
    if (tasks.length <= 1) {
      showToast("최소 한 개의 게시판 항목이 보존되어야 합니다!", "error");
      return;
    }
    const filteredTasks = tasks.filter((t) => t.id !== id);
    setTasks(filteredTasks);
    // Delete associated submissions
    setSubmissions((prev) => prev.filter((s) => s.taskId !== id));
    // Select the first remaining task
    if (selectedTaskId === id) {
      setSelectedTaskId(filteredTasks[0].id);
    }
    showToast("📋 과제 및 검사 항목이 삭제되었습니다.", "success");
  };

  // Reset current task submissions
  const handleResetSubmissions = () => {
    if (confirmResetTaskId === selectedTaskId) {
      setSubmissions((prev) => prev.filter((s) => s.taskId !== selectedTaskId));
      setConfirmResetTaskId(null);
      if (soundEnabled) playPopSound();
      showToast("🧼 제출 내역이 모두 초기화되었습니다! 제출률이 0%로 조정되었습니다.", "success");
    } else {
      setConfirmResetTaskId(selectedTaskId);
      // Automatically reset confirmation state after 4 seconds
      setTimeout(() => {
        setConfirmResetTaskId((prev) => prev === selectedTaskId ? null : prev);
      }, 4000);
    }
  };

  // Send virtual cheering alert to unsubmitted children
  const handleSendEncouragingChime = () => {
    if (soundEnabled) {
      playSuccessSound();
    }
    showToast("📢 아직 '다했어요'를 누르지 않은 친구들에게 수얌쌤의 비눗방울 응원을 보냈어요! 🫧✨", "info");
  };

  // Active student filter search
  const filteredStudents = students
    .filter((st) => st.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.num - b.num);

  // Student Manager functions
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: "std_" + Date.now(),
      num: newStudentNum,
      name: newStudentName.trim(),
      emoji: newStudentEmoji
    };
    setStudents([...students, newStudent]);
    setNewStudentName("");
    setNewStudentNum(students.length + 2);
    if (soundEnabled) playSuccessSound();
  };

  const handleStartEditStudent = (st: Student) => {
    setEditingStudentId(st.id);
    setEditName(st.name);
    setEditEmoji(st.emoji);
    setEditNum(st.num);
  };

  const handleSaveEditStudent = (id: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, name: editName, emoji: editEmoji, num: editNum } : s));
    setEditingStudentId(null);
    if (soundEnabled) playSuccessSound();
  };

  const handleDeleteStudent = (id: string) => {
    if (students.length <= 1) {
      showToast("최소 한 명의 어린이 명단은 있어야 정렬됩니다!", "error");
      return;
    }
    if (confirmDeleteStudentId === id) {
      setStudents(students.filter(s => s.id !== id));
      setSubmissions(prev => prev.filter(s => s.studentId !== id));
      setConfirmDeleteStudentId(null);
      if (soundEnabled) playPopSound();
      showToast("👤 어린이가 삭제되었습니다.", "success");
    } else {
      setConfirmDeleteStudentId(id);
      setTimeout(() => {
        setConfirmDeleteStudentId((prev) => prev === id ? null : prev);
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Non-blocking Visual Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] px-4"
          >
            <div className={`p-4 rounded-2xl shadow-xl border-2 flex items-center gap-3 font-semibold text-sm ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : toast.type === "error"
                ? "bg-rose-50 text-rose-900 border-rose-250"
                : "bg-pink-55/95 text-pink-950 border-pink-200"
            }`}>
              <span className="text-xl shrink-0">
                {toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "✨"}
              </span>
              <p className="flex-1 leading-snug font-black">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Task Tabs (게시판 이름 / 검사 내용) */}
      <div className="bg-white rounded-[28px] p-6 shadow-xl border-4 border-pink-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-pink-100 rounded-2xl text-pink-600">
              <BookOpen className="w-6 h-6 text-pink-500" />
            </span>
            <div>
              <h2 className="font-black text-slate-950 text-xl md:text-2xl">어떤 걸 검사할까요? 🤓</h2>
              <p className="text-slate-600 text-sm md:text-base font-bold">확인할 검사 항목을 골라 친구들의 체크 현황을 보세요.</p>
            </div>
          </div>

          <button
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm md:text-base font-black border-2 transition-all cursor-pointer ${
              soundEnabled 
                ? "bg-pink-50/80 text-pink-850 border-pink-200" 
                : "bg-red-50 text-red-500 border-red-200"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            소리 알림: {soundEnabled ? "켜짐 🔊" : "꺼짐 🔇"}
          </button>
        </div>

        {/* Task Horizontal Tab Slider */}
        <div className="flex flex-wrap gap-2.5 mb-4">
          {tasks.map((task) => {
            const isSelected = task.id === selectedTaskId;
            // Count submission count for this individual task
            const taskSubmittedCount = students.filter(s => 
              submissions.find(sub => sub.taskId === task.id && sub.studentId === s.id)?.submitted
            ).length;
            const taskPc = totalStudentsCount > 0 ? Math.round((taskSubmittedCount / totalStudentsCount) * 100) : 0;

            return (
              <div key={task.id} className="relative group flex items-center">
                <button
                  id={`task-tab-${task.id}`}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm md:text-base font-black transition-all relative z-10 cursor-pointer ${
                    isSelected
                      ? "bg-pink-500 text-white shadow-md shadow-pink-100 scale-102 border-2 border-pink-600"
                      : "bg-pink-50/20 text-slate-705 hover:bg-pink-50 border-2 border-pink-100"
                  }`}
                >
                  <span>{task.title}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                    isSelected ? "bg-pink-750 text-pink-100" : "bg-pink-100 text-pink-850"
                  }`}>
                    {taskSubmittedCount}/{totalStudentsCount} ({taskPc}%)
                  </span>
                </button>

                {isTeacherMode && (
                  <button
                    id={`delete-task-${task.id}`}
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-1 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 opacity-60 hover:opacity-100 transition-all border border-red-100 animate-pulse cursor-pointer"
                    title="검사항목 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Teacher Task Admin Addition */}
        {isTeacherMode && (
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t-2 border-pink-50">
            <input
              id="new-task-title-input"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="예: 받아쓰기 공책 제출하기 📝"
              className="flex-1 bg-pink-50/15 border-2 border-pink-150 rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-slate-800 transition-all font-bold placeholder:text-slate-400"
            />
            <button
              id="add-task-btn"
              type="submit"
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl text-sm md:text-base font-black flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              새 과제 및 검사 추가
            </button>
            <button
              id="reset-current-task-btn"
              type="button"
              onClick={handleResetSubmissions}
              className={`px-5 py-3 rounded-2xl text-sm md:text-base font-black flex items-center justify-center gap-1 transition-all cursor-pointer border-2 ${
                confirmResetTaskId === selectedTaskId
                  ? "bg-red-600 text-white border-red-700 animate-pulse scale-102 shadow-lg"
                  : "text-red-600 bg-red-50 hover:bg-red-100/80 border-red-150"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${confirmResetTaskId === selectedTaskId ? "animate-spin" : ""}`} />
              {confirmResetTaskId === selectedTaskId ? "⚠️ 정말 전부 초기화할까요? (다시 클릭)" : "제출 초기화"}
            </button>
          </form>
        )}
      </div>

      {/* Progress & Stats Bar Dashboard */}
      <div className="bg-white rounded-[28px] p-5 md:p-6 shadow-xl border-4 border-pink-300">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 border-2 border-pink-450 flex items-center justify-center shadow-md">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <span className="text-sm font-black text-pink-600 block">제출 현황 보고서</span>
              <h3 className="font-extrabold text-slate-900 text-xl md:text-2xl leading-none mt-1">
                {tasks.find((t) => t.id === selectedTaskId)?.title || "선택된 공책"}
              </h3>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-pink-50/70 backdrop-blur-sm px-5 py-3 rounded-2xl border-2 border-pink-150 shadow-xs flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="text-left">
                <span className="text-xs text-slate-600 block font-extrabold leading-none font-sans">제출했어요 🎒</span>
                <span className="text-emerald-700 font-extrabold text-xl md:text-2xl block mt-1">{submittedCount}명</span>
              </div>
            </div>

            <div className="bg-pink-50/70 backdrop-blur-sm px-5 py-3 rounded-2xl border-2 border-pink-150 shadow-xs flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-pink-400 animate-pulse" />
              <div className="text-left">
                <span className="text-xs text-slate-600 block font-extrabold leading-none font-sans">아직 남았어요 🏃</span>
                <span className="text-pink-650 font-extrabold text-xl md:text-2xl block mt-1">{unsubmittedCount}명</span>
              </div>
            </div>

            <div className="bg-pink-500 text-white px-6 py-3 rounded-2xl shadow-md flex items-center gap-2.5 border-2 border-pink-600">
              <div className="text-center font-bold">
                <span className="text-xs text-pink-100 block uppercase tracking-wider font-extrabold leading-none">전체 제출률</span>
                <span className="text-2xl font-black font-mono block mt-1">{submissionPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Creative Progress Bar with a Running Cute Emoticon */}
        <div className="mt-5 relative">
          <div className="h-7 bg-pink-50/30 rounded-full overflow-hidden p-1 relative border-2 border-pink-200">
            <motion.div
               layout
               initial={{ width: 0 }}
               animate={{ width: `${submissionPercent}%` }}
               transition={{ ease: "easeOut", duration: 0.6 }}
               className="h-full rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 shadow-inner flex items-center justify-end px-2"
            >
              {submissionPercent > 10 && (
                <span className="text-xs font-black font-mono text-pink-950 tracking-widest leading-none drop-shadow-sm">
                  {submissionPercent}%
                </span>
              )}
            </motion.div>

            {/* Cute runaway emoji sitting at the edge of active progress! */}
            <motion.span
              style={{ left: `calc(${submissionPercent}% - 14px)` }}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute text-2xl top-[-2px] select-none transition-all duration-500 pointer-events-none"
            >
              {submissionPercent === 100 ? "👑" : "🚲"}
            </motion.span>
          </div>

          <div className="flex justify-between text-xs md:text-sm font-black text-slate-600 px-1 mt-1 font-mono">
            <span>0%</span>
            <span>중간 지점 🏃‍♂️</span>
            <span>모두 완료! 🎉</span>
          </div>
        </div>

        {/* 105% completed banner or Encouragement bubble */}
        <AnimatePresence>
          {submissionPercent === 100 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mt-4 bg-pink-50/50 border-2 border-pink-350 text-pink-955 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm md:text-base font-bold"
            >
              <div className="flex items-center gap-3 text-center sm:text-left">
                <PartyPopper className="w-10 h-10 text-pink-500 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-black text-slate-900 text-base md:text-lg">우와! 우리 반 모두 다했어요! 🏆</h4>
                  <p className="text-slate-800 font-extrabold text-xs md:text-sm mt-0.5">한 명도 빠짐없이 완벽하게 제출 완료했습니다. 모두 최고예요! 💖</p>
                </div>
              </div>
              <button
                id="celebrate-btn"
                onClick={() => {
                  if (soundEnabled) {
                    playTadaSound();
                    playApplauseSound();
                  }
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white font-black px-5 py-2.5 rounded-xl text-xs md:text-sm shadow-md transition-all border-2 border-pink-600 cursor-pointer shrink-0"
              >
                축하 보너스 소리치기 👏✨
              </button>
            </motion.div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2 items-center justify-between bg-pink-50/20 p-3 rounded-2xl border-2 border-pink-100">
              <span className="text-slate-800 text-xs md:text-sm font-black">
                 아직 <strong className="text-pink-600 text-sm md:text-base font-black">{unsubmittedCount}명</strong>의 어린이가 제출하지 않았어요.
              </span>
              <button
                id="cheer-btn"
                onClick={handleSendEncouragingChime}
                className="bg-pink-50 hover:bg-pink-100 text-pink-900 font-black text-xs md:text-sm px-4 py-2 rounded-xl border-2 border-pink-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-pink-500" />
                응원 비눗방울 보내기 🫧
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* List Search and Main Student Grid */}
      <div className="bg-white rounded-[28px] p-6 shadow-xl border-4 border-pink-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-slate-950 text-lg md:text-xl flex items-center gap-1.5">
              <span>우리 반 친구들 명단 (이름을 터치하세요!) 👇</span>
            </h3>
            <p className="text-slate-600 text-sm font-bold font-sans mt-1">자기 이름의 귀여운 이모티콘 카드를 누르면 '제출완료' 기호가 나타나요!</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4.5 h-4.5 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="student-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="친구 이름 검색..."
                className="bg-pink-50/25 border-2 border-pink-100 rounded-2xl pl-11 pr-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-slate-800 font-extrabold transition-all"
              />
            </div>

            {isTeacherMode && (
              <button
                id="show-student-mgr-btn"
                onClick={() => setShowStudentManager(!showStudentManager)}
                className={`px-4 py-3 rounded-2xl border-2 text-sm font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  showStudentManager
                    ? "bg-slate-900 text-white border-slate-950"
                    : "bg-pink-50 text-slate-800 hover:bg-pink-100/50 border-pink-150"
                }`}
              >
                <Edit3 className="w-4 h-4 text-pink-500" />
                학생 명단 편집방 {showStudentManager ? "닫기" : "열기"}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Student Manager (for Teacher Classroom Setup) */}
        <AnimatePresence>
          {isTeacherMode && showStudentManager && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-2 border-pink-300 mb-6 pb-6 bg-pink-50/20 rounded-2xl p-4"
            >
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">🛠️ 우리반 어린이 명단 편집</h4>
              
              {/* Add Student Form */}
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4 bg-white p-3 rounded-2xl border-2 border-pink-100">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">번호</label>
                  <input
                    type="number"
                    value={newStudentNum}
                    onChange={(e) => setNewStudentNum(parseInt(e.target.value) || 1)}
                    className="border-2 border-pink-100 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-pink-300 font-bold text-slate-800"
                    min="1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">이름</label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="border-2 border-pink-100 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-pink-300 font-bold text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">이모티콘</label>
                  <select
                    value={newStudentEmoji}
                    onChange={(e) => setNewStudentEmoji(e.target.value)}
                    className="border-2 border-pink-100 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-pink-400 font-bold text-slate-800 bg-white"
                  >
                    {EMOJI_POOL.map((em) => (
                      <option key={em} value={em}>
                        {em} {em}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black text-xs py-2.5 rounded-xl transition border-2 border-pink-600 shadow-md cursor-pointer"
                  >
                    어린이 등록 👤
                  </button>
                </div>
              </form>

              {/* Student Rows Table */}
              <div className="max-h-56 overflow-y-auto space-y-1 bg-white p-2 rounded-2xl border border-slate-200">
                {students.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs py-1.5 px-3 hover:bg-slate-50 rounded-xl border-b last:border-b-0 border-slate-100">
                    {editingStudentId === st.id ? (
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <input
                          type="number"
                          value={editNum}
                          onChange={(e) => setEditNum(parseInt(e.target.value) || 1)}
                          className="w-12 border p-1 rounded-md text-center"
                        />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-24 border p-1 rounded-md"
                        />
                        <select
                          value={editEmoji}
                          onChange={(e) => setEditEmoji(e.target.value)}
                          className="border p-1 rounded-md"
                        >
                          {EMOJI_POOL.map((em) => (
                            <option key={em} value={em}>
                              {em}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSaveEditStudent(st.id)}
                          className="bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingStudentId(null)}
                          className="bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px]"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-slate-700">
                          {st.num}번 - {st.emoji} {st.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEditStudent(st)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                          >
                            수정 ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className={`p-1 rounded text-xs transition-all ${
                              confirmDeleteStudentId === st.id
                                ? "bg-red-600 text-white font-black px-2 py-0.5 animate-pulse"
                                : "text-red-500 hover:bg-red-50"
                            }`}
                          >
                            {confirmDeleteStudentId === st.id ? "⚠️ 정말요?" : "삭제"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Student Active Grid cards layout */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-pink-50/50 rounded-3xl text-slate-400 border-2 border-dashed border-pink-200">
            <span className="text-4xl block mb-2">🔎</span>
            <p className="text-sm font-black text-slate-600">검색한 어린이가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredStudents.map((st) => {
              const checked = isStudentSubmitted(st.id);
              return (
                <motion.button
                  id={`student-card-${st.id}`}
                  key={st.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleStudentSubmission(st.id)}
                  className={`p-3.5 rounded-2xl transition-all duration-300 relative text-center border-4 overflow-hidden flex flex-col items-center justify-center min-h-[116px] shadow-xs cursor-pointer ${
                    checked
                      ? "bg-[#FFF0F3] border-pink-450 hover:bg-[#FFE4E8] shadow-pink-100"
                      : "bg-white border-pink-100 hover:border-pink-300 hover:bg-pink-50/50"
                  }`}
                >
                  {/* Subtle checklist badge overlay inside top right */}
                  <div className="absolute top-2 right-2.5">
                    {checked ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Check className="w-4 h-4 text-pink-700 bg-pink-100 border-2 border-pink-400 p-0.5 rounded-full font-black" />
                      </motion.div>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-pink-200 block bg-slate-50/50" />
                    )}
                  </div>

                  {/* Student Number */}
                  <span className={`text-xs md:text-sm font-black px-2.5 py-1 rounded-md mb-2 font-mono ${
                    checked ? "bg-pink-200 text-pink-850" : "bg-pink-50 text-pink-700"
                  }`}>
                    {st.num}번
                  </span>

                  {/* Big Clickable Emoji */}
                  <motion.div
                    animate={checked ? { scale: [1, 1.3, 1], rotate: [0, 8, -8, 0] } : {}}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-5xl mb-2 drop-shadow-sm select-none"
                  >
                    {st.emoji}
                  </motion.div>

                  {/* Student Name */}
                  <span className={`text-sm md:text-base font-black tracking-tight ${
                    checked ? "text-slate-500 line-through text-opacity-70" : "text-slate-900 hover:text-pink-600"
                  }`}>
                    {st.name}
                  </span>

                  {/* Success check label stamp */}
                  {checked && (
                    <span className="text-xs text-pink-600 font-extrabold block mt-1 uppercase tracking-wider">
                      제출완료 👍
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Two lists grouped into Submitted vs Not-Submitted for easy monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submitted List panel */}
        <div className="bg-white rounded-[28px] p-6 shadow-lg border-4 border-emerald-250">
          <h4 className="font-extrabold text-[#047857] text-base md:text-lg flex items-center justify-between gap-1.5 mb-4">
            <span className="flex items-center gap-2 font-black">
              <span>🎉 제출 완료한 친구들!</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs md:text-sm font-mono font-bold px-3 py-1 rounded-full">
                {submittedCount}명
              </span>
            </span>
          </h4>

          {submittedCount === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center italic font-bold">첫 번째 체크의 주인공은 누구일까요? 🙋‍♂️</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
              {students
                .filter((st) => isStudentSubmitted(st.id))
                .map((st) => (
                  <span
                    key={st.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-55/20 border-2 border-emerald-200 text-slate-800 rounded-full text-sm md:text-base font-bold shadow-2xs"
                  >
                    <span>{st.emoji}</span>
                    <span>{st.name}</span>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Unsubmitted List panel */}
        <div className="bg-white rounded-[28px] p-6 shadow-lg border-4 border-pink-200">
          <h4 className="font-extrabold text-pink-850 text-base md:text-lg flex items-center justify-between gap-1.5 mb-4">
            <span className="flex items-center gap-2 font-black">
              <span>🏃‍♂️ 열심히 노력 중인 친구들!</span>
              <span className="bg-pink-100 text-pink-950 text-xs md:text-sm font-mono font-bold px-3 py-1 rounded-full animate-bounce">
                {unsubmittedCount}명
              </span>
            </span>
          </h4>

          {unsubmittedCount === 0 ? (
            <p className="text-sm text-pink-600 py-6 text-center font-bold">참 참 잘했어요! 온 학급 어린이가 완벽하게 완료했습니다! 🥇</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
              {students
                .filter((st) => !isStudentSubmitted(st.id))
                .map((st) => (
                  <span
                    key={st.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border-2 border-pink-100 text-pink-605 rounded-full text-sm md:text-base font-bold shadow-2xs"
                  >
                    <span>{st.emoji}</span>
                    <span>{st.name}</span>
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
