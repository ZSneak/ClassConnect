import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  X,
  Clock,
  MapPin,
  User,
  Zap,
  Grid,
  Sliders,
  Lock,
  Unlock,
  Key,
  ShieldAlert,
  Info
} from 'lucide-react';

// --- CONFIGURATION ---
const DEFAULT_ADMIN_PASSCODE = 'admin123'; // Change this passcode for your deployment

// --- INITIAL MOCK DATA ---
const INITIAL_BLOCKS = [
  { id: 'b1', name: 'Block 1', time: '08:00 AM - 09:15 AM' },
  { id: 'b2', name: 'Block 2', time: '09:25 AM - 10:40 AM' },
  { id: 'b3', name: 'Block 3', time: '10:50 AM - 12:05 PM' },
  { id: 'b4', name: 'Block 4', time: '01:00 PM - 02:15 PM' },
];

const INITIAL_COURSES = [
  { id: 'c1', code: 'MATH401', name: 'AP Calculus BC', blockId: 'b1', room: 'Room 204', teacher: 'Dr. Smith', color: 'bg-blue-500' },
  { id: 'c2', code: 'ENG301', name: 'Honors English 11', blockId: 'b1', room: 'Room 112', teacher: 'Ms. Vance', color: 'bg-purple-500' },
  { id: 'c3', code: 'SCI302', name: 'AP Physics C', blockId: 'b2', room: 'Lab 3', teacher: 'Mr. Davis', color: 'bg-emerald-500' },
  { id: 'c4', code: 'HIST201', name: 'US History', blockId: 'b2', room: 'Room 108', teacher: 'Mrs. Gable', color: 'bg-amber-500' },
  { id: 'c5', code: 'CS102', name: 'Computer Science A', blockId: 'b3', room: 'Lab 1', teacher: 'Mr. Turing', color: 'bg-indigo-500' },
  { id: 'c6', code: 'ART101', name: 'Studio Art II', blockId: 'b3', room: 'Art Studio', teacher: 'Ms. Monet', color: 'bg-rose-500' },
  { id: 'c7', code: 'SPAN301', name: 'Spanish III', blockId: 'b4', room: 'Room 210', teacher: 'Sra. Rivera', color: 'bg-teal-500' },
  { id: 'c8', code: 'PE101', name: 'Fitness & Health', blockId: 'b4', room: 'Gym A', teacher: 'Coach Ross', color: 'bg-orange-500' },
];

const INITIAL_STUDENTS = [
  { id: 's1', name: 'Emma Watson', grade: '11th Grade', avatarBg: 'bg-indigo-100 text-indigo-700' },
  { id: 's2', name: 'Lucas Scott', grade: '11th Grade', avatarBg: 'bg-emerald-100 text-emerald-700' },
  { id: 's3', name: 'Sophia Chen', grade: '12th Grade', avatarBg: 'bg-rose-100 text-rose-700' },
  { id: 's4', name: 'Noah Miller', grade: '11th Grade', avatarBg: 'bg-amber-100 text-amber-700' },
  { id: 's5', name: 'Olivia Davis', grade: '10th Grade', avatarBg: 'bg-purple-100 text-purple-700' },
  { id: 's6', name: 'Ethan Hunt', grade: '12th Grade', avatarBg: 'bg-blue-100 text-blue-700' },
  { id: 's7', name: 'Ava Martinez', grade: '11th Grade', avatarBg: 'bg-teal-100 text-teal-700' },
];

const INITIAL_ENROLLMENTS = [
  // Emma Watson
  { studentId: 's1', courseId: 'c1' },
  { studentId: 's1', courseId: 'c3' },
  { studentId: 's1', courseId: 'c5' },
  { studentId: 's1', courseId: 'c7' },
  // Lucas Scott
  { studentId: 's2', courseId: 'c1' },
  { studentId: 's2', courseId: 'c3' },
  { studentId: 's2', courseId: 'c6' },
  { studentId: 's2', courseId: 'c7' },
  // Sophia Chen
  { studentId: 's3', courseId: 'c2' },
  { studentId: 's3', courseId: 'c3' },
  { studentId: 's3', courseId: 'c5' },
  { studentId: 's3', courseId: 'c8' },
  // Noah Miller
  { studentId: 's4', courseId: 'c1' },
  { studentId: 's4', courseId: 'c4' },
  { studentId: 's4', courseId: 'c5' },
  { studentId: 's4', courseId: 'c7' },
  // Olivia Davis
  { studentId: 's5', courseId: 'c2' },
  { studentId: 's5', courseId: 'c4' },
  { studentId: 's5', courseId: 'c6' },
  { studentId: 's5', courseId: 'c8' },
  // Ethan Hunt
  { studentId: 's6', courseId: 'c1' },
  { studentId: 's6', courseId: 'c3' },
  { studentId: 's6', courseId: 'c5' },
  { studentId: 's6', courseId: 'c8' },
  // Ava Martinez
  { studentId: 's7', courseId: 'c2' },
  { studentId: 's7', courseId: 'c3' },
  { studentId: 's7', courseId: 'c6' },
  { studentId: 's7', courseId: 'c7' },
];

export default function App() {
  // --- ADMIN & SECURITY STATE ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // --- DATA STATE ---
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [enrollments, setEnrollments] = useState(INITIAL_ENROLLMENTS);

  // Active view tab: 'finder' | 'compare' | 'grid' | 'classes' | 'students'
  const [activeTab, setActiveTab] = useState('finder');

  // Finder state
  const [selectedStudentId, setSelectedStudentId] = useState('s1');
  
  // Comparison state
  const [compareStudentA, setCompareStudentA] = useState('s1');
  const [compareStudentB, setCompareStudentB] = useState('s2');

  // Modals & Forms
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedCourseForRoster, setSelectedCourseForRoster] = useState(null);

  // Quick filters / Search
  const [searchTerm, setSearchTerm] = useState('');

  // --- PASSCODE UNLOCK HANDLER ---
  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    if (passcodeInput === DEFAULT_ADMIN_PASSCODE) {
      setIsAdmin(true);
      setIsPasscodeModalOpen(false);
      setPasscodeInput('');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
  };

  // --- HELPER CALCULATIONS ---

  // Get courses enrolled by student
  const getStudentCourses = (studentId) => {
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
    return studentEnrollments
      .map(e => courses.find(c => c.id === e.courseId))
      .filter(Boolean);
  };

  // Get students enrolled in course
  const getCourseStudents = (courseId) => {
    const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
    return courseEnrollments
      .map(e => students.find(s => s.id === e.studentId))
      .filter(Boolean);
  };

  // Check if student is in class
  const isEnrolled = (studentId, courseId) => {
    return enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
  };

  // Toggle enrollment
  const toggleEnrollment = (studentId, courseId) => {
    if (!isAdmin) return;
    setEnrollments(prev => {
      const exists = prev.some(e => e.studentId === studentId && e.courseId === courseId);
      if (exists) {
        return prev.filter(e => !(e.studentId === studentId && e.courseId === courseId));
      } else {
        return [...prev, { studentId, courseId }];
      }
    });
  };

  // Assign class to block for a student (replacing any existing enrollment in that block)
  const setStudentCourseForBlock = (studentId, blockId, newCourseId) => {
    if (!isAdmin) return;
    setEnrollments(prev => {
      const blockCourseIds = courses.filter(c => c.blockId === blockId).map(c => c.id);
      const filtered = prev.filter(e => !(e.studentId === studentId && blockCourseIds.includes(e.courseId)));
      
      if (newCourseId) {
        return [...filtered, { studentId, courseId: newCourseId }];
      }
      return filtered;
    });
  };

  // Calculate shared classes between target student and all other students
  const classmateSynergyList = useMemo(() => {
    if (!selectedStudentId) return [];
    
    const targetCourses = getStudentCourses(selectedStudentId);
    const targetCourseIds = new Set(targetCourses.map(c => c.id));

    return students
      .filter(s => s.id !== selectedStudentId)
      .map(student => {
        const otherCourses = getStudentCourses(student.id);
        const shared = otherCourses.filter(c => targetCourseIds.has(c.id));
        return {
          student,
          sharedCourses: shared,
          sharedCount: shared.length,
          totalTargetClasses: targetCourses.length
        };
      })
      .sort((a, b) => b.sharedCount - a.sharedCount);
  }, [selectedStudentId, enrollments, courses, students]);

  // Selected student details
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Reset to default sample data
  const handleResetData = () => {
    if (!isAdmin) return;
    if (window.confirm("Reset schedule data back to sample defaults?")) {
      setBlocks(INITIAL_BLOCKS);
      setCourses(INITIAL_COURSES);
      setStudents(INITIAL_STUDENTS);
      setEnrollments(INITIAL_ENROLLMENTS);
    }
  };

  // --- ACTIONS FOR MODALS ---
  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.target);
    const courseData = {
      id: editingCourse ? editingCourse.id : `c_${Date.now()}`,
      code: formData.get('code'),
      name: formData.get('name'),
      blockId: formData.get('blockId'),
      room: formData.get('room'),
      teacher: formData.get('teacher'),
      color: formData.get('color') || 'bg-indigo-500'
    };

    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? courseData : c));
    } else {
      setCourses([...courses, courseData]);
    }

    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.target);
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-emerald-100 text-emerald-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
      'bg-purple-100 text-purple-700',
      'bg-blue-100 text-blue-700',
      'bg-teal-100 text-teal-700',
      'bg-orange-100 text-orange-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const studentData = {
      id: editingStudent ? editingStudent.id : `s_${Date.now()}`,
      name: formData.get('name'),
      grade: formData.get('grade'),
      avatarBg: editingStudent ? editingStudent.avatarBg : randomColor
    };

    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? studentData : s));
    } else {
      setStudents([...students, studentData]);
      if (!selectedStudentId) setSelectedStudentId(studentData.id);
    }

    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteCourse = (courseId) => {
    if (!isAdmin) return;
    if (confirm("Are you sure you want to delete this class? Enrollments will be cleared.")) {
      setCourses(courses.filter(c => c.id !== courseId));
      setEnrollments(enrollments.filter(e => e.courseId !== courseId));
    }
  };

  const handleDeleteStudent = (studentId) => {
    if (!isAdmin) return;
    if (confirm("Are you sure you want to remove this student?")) {
      setStudents(students.filter(s => s.id !== studentId));
      setEnrollments(enrollments.filter(e => e.studentId !== studentId));
      if (selectedStudentId === studentId) {
        const remaining = students.filter(s => s.id !== studentId);
        setSelectedStudentId(remaining.length > 0 ? remaining[0].id : '');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                ClassConnect
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  Schedule Radar
                </span>
              </h1>
              <p className="text-xs text-slate-500">Find shared classes & classmate schedule overlaps</p>
            </div>
          </div>

          {/* Quick Action Controls & Security Toggle */}
          <div className="flex items-center space-x-2">
            {/* Mode Indicator & Toggle */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5 text-amber-600" /> Admin Edit Mode
                </span>
                <button
                  onClick={handleLockAdmin}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  title="Lock Admin Editing"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> Lock
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setPasscodeError(false); setIsPasscodeModalOpen(true); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Unlock Edit Mode
              </button>
            )}

            {/* Admin Controls */}
            {isAdmin && (
              <>
                <button
                  onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Class
                </button>
                <button
                  onClick={() => { setEditingStudent(null); setIsStudentModalOpen(true); }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Student
                </button>
                <button
                  onClick={handleResetData}
                  title="Reset Sample Data"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-transparent hover:border-slate-200 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex space-x-1 sm:space-x-4 overflow-x-auto">
          {[
            { id: 'finder', label: 'Classmate Finder', icon: Sparkles },
            { id: 'compare', label: 'Side-by-Side Compare', icon: Sliders },
            { id: 'grid', label: 'Master Schedule Grid', icon: Grid },
            { id: 'classes', label: `Classes (${courses.length})`, icon: BookOpen },
            { id: 'students', label: `Students (${students.length})`, icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 transition ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* --- READ-ONLY NOTICE FOR VISITORS --- */}
      {!isAdmin && (
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 text-xs text-indigo-800 text-center flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Viewing in Read-Only Mode. To add or modify classes and student schedules, click <strong>"Unlock Edit Mode"</strong>.</span>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ========================================================= */}
        {/* TAB 1: CLASSMATE OVERLAP FINDER                           */}
        {/* ========================================================= */}
        {activeTab === 'finder' && (
          <div className="space-y-6">
            {/* Student Selector Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ${currentStudent?.avatarBg || 'bg-slate-100 text-slate-700'}`}>
                  {currentStudent?.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Select Target Student
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="text-lg font-bold text-slate-900 bg-transparent border-b-2 border-indigo-200 focus:border-indigo-600 focus:outline-none pr-8 py-0.5 cursor-pointer"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Overview Metrics */}
              <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block font-medium">Classes Enrolled</span>
                  <span className="text-lg font-bold text-slate-800">
                    {getStudentCourses(selectedStudentId).length} / {blocks.length} Blocks
                  </span>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-center">
                  <span className="text-xs text-indigo-500 block font-medium">Top Match</span>
                  <span className="text-lg font-bold text-indigo-700">
                    {classmateSynergyList.length > 0 && classmateSynergyList[0].sharedCount > 0
                      ? `${classmateSynergyList[0].student.name} (${classmateSynergyList[0].sharedCount} shared)`
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Grid: Schedule vs Classmates Synergy */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT: Period-by-Period Schedule with Classmates */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    {currentStudent?.name}'s Daily Schedule
                  </h2>
                  <span className="text-xs text-slate-500">Block Breakdown & Classmates</span>
                </div>

                <div className="space-y-3">
                  {blocks.map((block) => {
                    const studentCourses = getStudentCourses(selectedStudentId);
                    const course = studentCourses.find(c => c.blockId === block.id);
                    const classmates = course ? getCourseStudents(course.id).filter(s => s.id !== selectedStudentId) : [];

                    return (
                      <div key={block.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition">
                        {/* Period Header */}
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {block.name}
                          </span>
                          <span className="text-slate-400">{block.time}</span>
                        </div>

                        <div className="p-4">
                          {course ? (
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${course.color}`} />
                                    <h3 className="font-bold text-slate-900 text-base">{course.name}</h3>
                                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                                      {course.code}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 ml-5">
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {course.room}</span>
                                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {course.teacher}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Classmates Tagged inside this class */}
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    People in this class ({classmates.length}):
                                  </span>
                                </div>

                                {classmates.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {classmates.map(cm => (
                                      <button
                                        key={cm.id}
                                        onClick={() => setSelectedStudentId(cm.id)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition border border-slate-200/60"
                                        title={`Click to view ${cm.name}'s schedule`}
                                      >
                                        <span className={`w-2 h-2 rounded-full ${cm.avatarBg}`} />
                                        {cm.name}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">No other students enrolled yet.</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="py-3 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                              <p className="text-xs text-slate-400 font-medium">Free Period / Unassigned</p>
                              {isAdmin && (
                                <button
                                  onClick={() => setActiveTab('students')}
                                  className="text-xs text-indigo-600 hover:underline font-semibold mt-1 inline-block"
                                >
                                  + Assign Class in Students tab
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Classmates Synergy Leaderboard */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Shared Class Leaderboard
                  </h2>
                  <span className="text-xs text-slate-500">Most Overlapping Classmates</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2 space-y-2">
                  {classmateSynergyList.length > 0 ? (
                    classmateSynergyList.map(({ student, sharedCourses, sharedCount }) => (
                      <div
                        key={student.id}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/80 transition flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${student.avatarBg}`}>
                            {student.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition">
                              {student.name}
                            </h4>
                            <p className="text-xs text-slate-400">{student.grade}</p>
                            
                            {/* Shared badges */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sharedCourses.map(sc => (
                                <span key={sc.id} className="text-[10px] font-medium bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
                                  {sc.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            sharedCount > 2
                              ? 'bg-emerald-100 text-emerald-800'
                              : sharedCount > 0
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {sharedCount} Shared
                          </span>
                          <button
                            onClick={() => {
                              setCompareStudentA(selectedStudentId);
                              setCompareStudentB(student.id);
                              setActiveTab('compare');
                            }}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition"
                          >
                            Compare <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No other students available to compare.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SIDE-BY-SIDE COMPARISON                             */}
        {/* ========================================================= */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Direct Schedule Comparison
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {/* Student A Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Student A
                  </label>
                  <select
                    value={compareStudentA}
                    onChange={(e) => setCompareStudentA(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>

                {/* Student B Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Student B
                  </label>
                  <select
                    value={compareStudentB}
                    onChange={(e) => setCompareStudentB(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                <span>Block Match Breakdown</span>
                {(() => {
                  const coursesA = getStudentCourses(compareStudentA);
                  const coursesB = getStudentCourses(compareStudentB);
                  const matchCount = coursesA.filter(cA => coursesB.some(cB => cB.id === cA.id)).length;
                  return (
                    <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                      {matchCount} Block Overlaps
                    </span>
                  );
                })()}
              </div>

              <div className="divide-y divide-slate-100">
                {blocks.map(block => {
                  const courseA = getStudentCourses(compareStudentA).find(c => c.blockId === block.id);
                  const courseB = getStudentCourses(compareStudentB).find(c => c.blockId === block.id);
                  const isSameClass = courseA && courseB && courseA.id === courseB.id;

                  return (
                    <div key={block.id} className={`p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center ${isSameClass ? 'bg-emerald-50/40' : ''}`}>
                      <div className="md:col-span-3 font-semibold text-xs text-slate-600">
                        <span className="block font-bold text-slate-800">{block.name}</span>
                        <span className="text-slate-400">{block.time}</span>
                      </div>

                      {/* Student A Class */}
                      <div className="md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        {courseA ? (
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{courseA.name}</span>
                            <span className="text-[11px] text-slate-500">{courseA.room} • {courseA.teacher}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No class</span>
                        )}
                      </div>

                      {/* Match Status Icon */}
                      <div className="md:col-span-1 flex items-center justify-center">
                        {isSameClass ? (
                          <span className="p-1.5 bg-emerald-500 text-white rounded-full shadow" title="Shared Class!">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-1.5 bg-slate-200 text-slate-400 rounded-full">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      {/* Student B Class */}
                      <div className="md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        {courseB ? (
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{courseB.name}</span>
                            <span className="text-[11px] text-slate-500">{courseB.room} • {courseB.teacher}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No class</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MASTER SCHEDULE GRID                                */}
        {/* ========================================================= */}
        {activeTab === 'grid' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Master Schedule Matrix</h2>
                <p className="text-xs text-slate-500">Overview of all students across all blocks</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="p-4 min-w-[180px] sticky left-0 bg-slate-50 z-10">Student</th>
                    {blocks.map(b => (
                      <th key={b.id} className="p-4 min-w-[200px]">
                        <span className="font-bold text-slate-700 block">{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{b.time}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students
                    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(student => {
                      const studentCourses = getStudentCourses(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-semibold text-slate-900 sticky left-0 bg-white border-r border-slate-100 z-10 flex items-center space-x-2">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${student.avatarBg}`}>
                              {student.name.split(' ').map(n=>n[0]).join('')}
                            </span>
                            <div>
                              <span className="block">{student.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{student.grade}</span>
                            </div>
                          </td>

                          {blocks.map(block => {
                            const course = studentCourses.find(c => c.blockId === block.id);
                            return (
                              <td key={block.id} className="p-3">
                                {course ? (
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${course.color}`} />
                                      <span className="font-bold text-slate-800 truncate">{course.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">{course.room}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 italic text-[11px]">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CLASS & ROSTER MANAGEMENT                           */}
        {/* ========================================================= */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Class Directory & Rosters</h2>
                <p className="text-xs text-slate-500">Manage subject offerings, teachers, rooms, and enrolled students</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create New Class
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(course => {
                const block = blocks.find(b => b.id === course.blockId);
                const enrolled = getCourseStudents(course.id);

                return (
                  <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {block?.name || 'Unassigned Block'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{course.name}</h3>
                        <span className="text-xs font-mono text-slate-500">{course.code}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 space-y-3">
                      <div className="text-xs space-y-1 text-slate-600">
                        <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {course.room}</p>
                        <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> {course.teacher}</p>
                      </div>

                      {/* Roster preview */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-slate-700">Enrolled Students ({enrolled.length})</span>
                          {isAdmin && (
                            <button
                              onClick={() => { setSelectedCourseForRoster(course); setIsRosterModalOpen(true); }}
                              className="text-indigo-600 font-bold hover:underline"
                            >
                              Edit Roster
                            </button>
                          )}
                        </div>

                        {enrolled.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {enrolled.map(s => (
                              <span key={s.id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No students enrolled</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: STUDENT DIRECTORY & SCHEDULE BUILDER                */}
        {/* ========================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Student Directory</h2>
                <p className="text-xs text-slate-500">View schedules or assign classes (admin mode required)</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => { setEditingStudent(null); setIsStudentModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add New Student
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {students.map(student => {
                const studentCourses = getStudentCourses(student.id);

                return (
                  <div key={student.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${student.avatarBg}`}>
                          {student.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{student.name}</h3>
                          <p className="text-xs text-slate-400">{student.grade}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => { setSelectedStudentId(student.id); setActiveTab('finder'); }}
                          className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 font-semibold rounded-md hover:bg-indigo-100"
                        >
                          View Radar
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Block Schedule Display or Assigner */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Schedule Overview
                      </span>
                      {blocks.map(block => {
                        const availableCourses = courses.filter(c => c.blockId === block.id);
                        const currentCourse = studentCourses.find(c => c.blockId === block.id);

                        return (
                          <div key={block.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="font-semibold text-slate-600 w-24">{block.name}:</span>
                            
                            {isAdmin ? (
                              <select
                                value={currentCourse ? currentCourse.id : ''}
                                onChange={(e) => setStudentCourseForBlock(student.id, block.id, e.target.value)}
                                className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="">-- Free / No Class --</option>
                                {availableCourses.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ({c.teacher})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="flex-1 text-right font-medium text-slate-800">
                                {currentCourse ? `${currentCourse.name} (${currentCourse.room})` : <span className="text-slate-400 italic">Free</span>}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL: PASSCODE VERIFICATION                              */}
      {/* ========================================================= */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <Key className="w-5 h-5 text-indigo-600" /> Unlock Admin Mode
              </div>
              <button onClick={() => setIsPasscodeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Enter the admin passcode to enable editing features (adding classes, students, and modifying rosters).
            </p>

            <form onSubmit={handleUnlockAdmin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter passcode (default: admin123)"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Incorrect passcode. Try 'admin123'
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasscodeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT COURSE                                  */}
      {/* ========================================================= */}
      {isCourseModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingCourse ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name</label>
                <input
                  name="name"
                  required
                  defaultValue={editingCourse?.name || ''}
                  placeholder="e.g. AP Calculus BC"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    name="code"
                    required
                    defaultValue={editingCourse?.code || ''}
                    placeholder="e.g. MATH401"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Block</label>
                  <select
                    name="blockId"
                    defaultValue={editingCourse?.blockId || blocks[0].id}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {blocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Location</label>
                  <input
                    name="room"
                    required
                    defaultValue={editingCourse?.room || ''}
                    placeholder="e.g. Room 204"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher</label>
                  <input
                    name="teacher"
                    required
                    defaultValue={editingCourse?.teacher || ''}
                    placeholder="e.g. Dr. Smith"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT STUDENT                                 */}
      {/* ========================================================= */}
      {isStudentModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  name="name"
                  required
                  defaultValue={editingStudent?.name || ''}
                  placeholder="e.g. Alex Johnson"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grade Level</label>
                <select
                  name="grade"
                  defaultValue={editingStudent?.grade || '11th Grade'}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="9th Grade">9th Grade</option>
                  <option value="10th Grade">10th Grade</option>
                  <option value="11th Grade">11th Grade</option>
                  <option value="12th Grade">12th Grade</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT ROSTER FOR A CLASS                            */}
      {/* ========================================================= */}
      {isRosterModalOpen && selectedCourseForRoster && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedCourseForRoster.name}</h3>
                <p className="text-xs text-slate-500">Toggle student enrollment for this class</p>
              </div>
              <button onClick={() => setIsRosterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {students.map(student => {
                const enrolled = isEnrolled(student.id, selectedCourseForRoster.id);
                return (
                  <div key={student.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{student.name} ({student.grade})</span>
                    <button
                      onClick={() => toggleEnrollment(student.id, selectedCourseForRoster.id)}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        enrolled
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {enrolled ? 'Remove' : 'Enroll'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRosterModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}