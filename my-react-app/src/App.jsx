import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
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
  Info,
  Cloud,
  CloudOff
} from 'lucide-react';

// ============================================================================
// --- FIREBASE CONFIGURATION ---
// Replace the placeholder string values below with your credentials from the 
// Firebase Console.
// ============================================================================
const getEnvVar = (key) => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env[key]) || "";
  } catch (e) {
    return "";
  }
};

const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY") || "YOUR_API_KEY",
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN") || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID") || "YOUR_PROJECT_ID",
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET") || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID") || "YOUR_SENDER_ID",
  appId: getEnvVar("VITE_FIREBASE_APP_ID") || "YOUR_APP_ID"
};

// Check if valid Firebase credentials have been supplied
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
);

// Initialize Firebase App & Firestore Database
let db = null;
if (isFirebaseConfigured) {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// --- ADMIN SECURITY CONFIG ---
const DEFAULT_ADMIN_PASSCODE = 'admin123'; // Change this passcode for your deployment

// --- INITIAL MOCK / FALLBACK DATA ---
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
  { studentId: 's1', courseId: 'c1' }, { studentId: 's1', courseId: 'c3' }, { studentId: 's1', courseId: 'c5' }, { studentId: 's1', courseId: 'c7' },
  { studentId: 's2', courseId: 'c1' }, { studentId: 's2', courseId: 'c3' }, { studentId: 's2', courseId: 'c6' }, { studentId: 's2', courseId: 'c7' },
  { studentId: 's3', courseId: 'c2' }, { studentId: 's3', courseId: 'c3' }, { studentId: 's3', courseId: 'c5' }, { studentId: 's3', courseId: 'c8' },
  { studentId: 's4', courseId: 'c1' }, { studentId: 's4', courseId: 'c4' }, { studentId: 's4', courseId: 'c5' }, { studentId: 's4', courseId: 'c7' },
  { studentId: 's5', courseId: 'c2' }, { studentId: 's5', courseId: 'c4' }, { studentId: 's5', courseId: 'c6' }, { studentId: 's5', courseId: 'c8' },
  { studentId: 's6', courseId: 'c1' }, { studentId: 's6', courseId: 'c3' }, { studentId: 's6', courseId: 'c5' }, { studentId: 's6', courseId: 'c8' },
  { studentId: 's7', courseId: 'c2' }, { studentId: 's7', courseId: 'c3' }, { studentId: 's7', courseId: 'c6' }, { studentId: 's7', courseId: 'c7' },
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
  const [isSyncing, setIsSyncing] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState('finder');

  // Finder & Comparison state
  const [selectedStudentId, setSelectedStudentId] = useState('s1');
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

  // --- REALTIME FIRESTORE LISTENER ---
  useEffect(() => {
    if (!db) return;

    // Listen to real-time updates from Firestore cloud document
    const docRef = doc(db, 'classconnect', 'master_schedule');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.blocks) setBlocks(data.blocks);
        if (data.courses) setCourses(data.courses);
        if (data.students) setStudents(data.students);
        if (data.enrollments) setEnrollments(data.enrollments);
      } else {
        // Seed initial data if document doesn't exist in Firebase yet
        saveToCloud(INITIAL_BLOCKS, INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_ENROLLMENTS);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, []);

  // --- SAVE DATA TO FIRESTORE CLOUD ---
  const saveToCloud = async (newBlocks, newCourses, newStudents, newEnrollments) => {
    if (!db) return;
    setIsSyncing(true);
    try {
      const docRef = doc(db, 'classconnect', 'master_schedule');
      await setDoc(docRef, {
        blocks: newBlocks,
        courses: newCourses,
        students: newStudents,
        enrollments: newEnrollments,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to sync changes to Firebase Cloud:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // State mutation helpers with Cloud persistence
  const updateCourses = (newCourses) => {
    setCourses(newCourses);
    saveToCloud(blocks, newCourses, students, enrollments);
  };

  const updateStudents = (newStudents) => {
    setStudents(newStudents);
    saveToCloud(blocks, courses, newStudents, enrollments);
  };

  const updateEnrollments = (newEnrollments) => {
    setEnrollments(newEnrollments);
    saveToCloud(blocks, courses, students, newEnrollments);
  };

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

  const handleLockAdmin = () => setIsAdmin(false);

  // --- HELPER CALCULATIONS ---
  const getStudentCourses = (studentId) => {
    return enrollments
      .filter(e => e.studentId === studentId)
      .map(e => courses.find(c => c.id === e.courseId))
      .filter(Boolean);
  };

  const getCourseStudents = (courseId) => {
    return enrollments
      .filter(e => e.courseId === courseId)
      .map(e => students.find(s => s.id === e.studentId))
      .filter(Boolean);
  };

  const isEnrolled = (studentId, courseId) => {
    return enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
  };

  const toggleEnrollment = (studentId, courseId) => {
    if (!isAdmin) return;
    const exists = enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
    const updated = exists
      ? enrollments.filter(e => !(e.studentId === studentId && e.courseId === courseId))
      : [...enrollments, { studentId, courseId }];
    updateEnrollments(updated);
  };

  const setStudentCourseForBlock = (studentId, blockId, newCourseId) => {
    if (!isAdmin) return;
    const blockCourseIds = courses.filter(c => c.blockId === blockId).map(c => c.id);
    const filtered = enrollments.filter(e => !(e.studentId === studentId && blockCourseIds.includes(e.courseId)));
    const updated = newCourseId ? [...filtered, { studentId, courseId: newCourseId }] : filtered;
    updateEnrollments(updated);
  };

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
          sharedCount: shared.length
        };
      })
      .sort((a, b) => b.sharedCount - a.sharedCount);
  }, [selectedStudentId, enrollments, courses, students]);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleResetData = () => {
    if (!isAdmin) return;
    if (window.confirm("Reset schedule data back to sample defaults for all cloud users?")) {
      setBlocks(INITIAL_BLOCKS);
      setCourses(INITIAL_COURSES);
      setStudents(INITIAL_STUDENTS);
      setEnrollments(INITIAL_ENROLLMENTS);
      saveToCloud(INITIAL_BLOCKS, INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_ENROLLMENTS);
    }
  };

  // --- MODAL SUBMISSIONS ---
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

    const newCourses = editingCourse
      ? courses.map(c => c.id === editingCourse.id ? courseData : c)
      : [...courses, courseData];

    updateCourses(newCourses);
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.target);
    const colors = ['bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const studentData = {
      id: editingStudent ? editingStudent.id : `s_${Date.now()}`,
      name: formData.get('name'),
      grade: formData.get('grade'),
      avatarBg: editingStudent ? editingStudent.avatarBg : randomColor
    };

    const newStudents = editingStudent
      ? students.map(s => s.id === editingStudent.id ? studentData : s)
      : [...students, studentData];

    updateStudents(newStudents);
    if (!editingStudent && !selectedStudentId) setSelectedStudentId(studentData.id);
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteCourse = (courseId) => {
    if (!isAdmin) return;
    if (confirm("Are you sure you want to delete this class? Enrollments will be cleared.")) {
      const newCourses = courses.filter(c => c.id !== courseId);
      const newEnrollments = enrollments.filter(e => e.courseId !== courseId);
      setCourses(newCourses);
      setEnrollments(newEnrollments);
      saveToCloud(blocks, newCourses, students, newEnrollments);
    }
  };

  const handleDeleteStudent = (studentId) => {
    if (!isAdmin) return;
    if (confirm("Are you sure you want to remove this student?")) {
      const newStudents = students.filter(s => s.id !== studentId);
      const newEnrollments = enrollments.filter(e => e.studentId !== studentId);
      setStudents(newStudents);
      setEnrollments(newEnrollments);
      saveToCloud(blocks, courses, newStudents, newEnrollments);
      if (selectedStudentId === studentId) {
        setSelectedStudentId(newStudents.length > 0 ? newStudents[0].id : '');
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
            {/* Cloud Status Badge */}
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${
              isFirebaseConfigured 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {isFirebaseConfigured ? <Cloud className="w-3.5 h-3.5 text-emerald-600" /> : <CloudOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isFirebaseConfigured ? (isSyncing ? 'Syncing...' : 'Live Cloud Sync') : 'Local Mode'}</span>
            </div>

            {/* Admin Lock/Unlock Switch */}
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

        {/* Navigation Tabs */}
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
                  isActive ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Mode Banner */}
      {!isAdmin && (
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 text-xs text-indigo-800 text-center flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Viewing in Read-Only Mode. Click <strong>"Unlock Edit Mode"</strong> to edit schedules.</span>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* TAB 1: OVERLAP FINDER */}
        {activeTab === 'finder' && (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    {currentStudent?.name}'s Daily Schedule
                  </h2>
                  <span className="text-xs text-slate-500">Block Breakdown</span>
                </div>

                <div className="space-y-3">
                  {blocks.map((block) => {
                    const studentCourses = getStudentCourses(selectedStudentId);
                    const course = studentCourses.find(c => c.blockId === block.id);
                    const classmates = course ? getCourseStudents(course.id).filter(s => s.id !== selectedStudentId) : [];

                    return (
                      <div key={block.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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

                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 block mb-2">
                                  People in this class ({classmates.length}):
                                </span>
                                {classmates.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {classmates.map(cm => (
                                      <button
                                        key={cm.id}
                                        onClick={() => setSelectedStudentId(cm.id)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition"
                                      >
                                        <span className={`w-2 h-2 rounded-full ${cm.avatarBg}`} />
                                        {cm.name}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">No other students enrolled</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="py-3 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                              <p className="text-xs text-slate-400 font-medium">Free Period / Unassigned</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Shared Class Leaderboard
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2 space-y-2">
                  {classmateSynergyList.map(({ student, sharedCourses, sharedCount }) => (
                    <div key={student.id} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${student.avatarBg}`}>
                          {student.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{student.name}</h4>
                          <p className="text-xs text-slate-400">{student.grade}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                        {sharedCount} Shared
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPARISON */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Direct Schedule Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Student A</label>
                  <select value={compareStudentA} onChange={(e) => setCompareStudentA(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800">
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Student B</label>
                  <select value={compareStudentB} onChange={(e) => setCompareStudentB(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800">
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
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
                    <div className="md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {courseA ? <span className="text-xs font-bold block text-slate-800">{courseA.name}</span> : <span className="text-xs text-slate-400 italic">No class</span>}
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      {isSameClass ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-slate-300" />}
                    </div>
                    <div className="md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {courseB ? <span className="text-xs font-bold block text-slate-800">{courseB.name}</span> : <span className="text-xs text-slate-400 italic">No class</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MATRIX GRID */}
        {activeTab === 'grid' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Master Schedule Matrix</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input type="text" placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-1 text-xs border rounded-lg" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 uppercase font-semibold">
                    <th className="p-4 min-w-[160px]">Student</th>
                    {blocks.map(b => <th key={b.id} className="p-4 min-w-[180px]">{b.name}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                    <tr key={student.id}>
                      <td className="p-4 font-semibold text-slate-900">{student.name}</td>
                      {blocks.map(block => {
                        const course = getStudentCourses(student.id).find(c => c.blockId === block.id);
                        return (
                          <td key={block.id} className="p-3">
                            {course ? <span className="p-2 bg-slate-50 border rounded-lg block font-bold text-slate-800">{course.name}</span> : <span className="text-slate-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CLASSES */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {blocks.find(b=>b.id===course.blockId)?.name}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{course.name}</h3>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <button onClick={() => handleDeleteCourse(course.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">{course.room} • {course.teacher}</p>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Roster ({getCourseStudents(course.id).length})</span>
                    {isAdmin && <button onClick={() => { setSelectedCourseForRoster(course); setIsRosterModalOpen(true); }} className="text-indigo-600 font-bold">Edit</button>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getCourseStudents(course.id).map(s => <span key={s.id} className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">{s.name}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: STUDENTS */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map(student => (
              <div key={student.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-slate-900">{student.name} ({student.grade})</h3>
                  {isAdmin && <button onClick={() => handleDeleteStudent(student.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="space-y-2 text-xs">
                  {blocks.map(block => {
                    const currentCourse = getStudentCourses(student.id).find(c => c.blockId === block.id);
                    return (
                      <div key={block.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                        <span className="font-semibold text-slate-600">{block.name}:</span>
                        {isAdmin ? (
                          <select
                            value={currentCourse ? currentCourse.id : ''}
                            onChange={(e) => setStudentCourseForBlock(student.id, block.id, e.target.value)}
                            className="bg-white border rounded px-2 py-1 text-xs"
                          >
                            <option value="">-- Free --</option>
                            {courses.filter(c => c.blockId === block.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <span className="font-medium text-slate-800">{currentCourse ? currentCourse.name : 'Free'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* PASSCODE MODAL */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-600" /> Unlock Admin Mode</h3>
            <form onSubmit={handleUnlockAdmin} className="space-y-3">
              <input type="password" placeholder="Passcode (default: admin123)" value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value)} className="w-full border rounded-lg p-2.5 text-xs" autoFocus />
              {passcodeError && <p className="text-xs text-rose-600 font-semibold">Incorrect passcode. Try 'admin123'</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsPasscodeModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {isCourseModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-lg text-slate-900">{editingCourse ? 'Edit Class' : 'Add New Class'}</h3>
            <form onSubmit={handleSaveCourse} className="space-y-3">
              <input name="name" required defaultValue={editingCourse?.name || ''} placeholder="Class Name (e.g. AP Calculus BC)" className="w-full border rounded-lg p-2 text-xs" />
              <div className="grid grid-cols-2 gap-2">
                <input name="code" required defaultValue={editingCourse?.code || ''} placeholder="Code (e.g. MATH401)" className="border rounded-lg p-2 text-xs" />
                <select name="blockId" defaultValue={editingCourse?.blockId || blocks[0].id} className="border rounded-lg p-2 text-xs">
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="room" required defaultValue={editingCourse?.room || ''} placeholder="Room (e.g. Room 204)" className="border rounded-lg p-2 text-xs" />
                <input name="teacher" required defaultValue={editingCourse?.teacher || ''} placeholder="Teacher (e.g. Dr. Smith)" className="border rounded-lg p-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold">Save Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isStudentModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-lg text-slate-900">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-3">
              <input name="name" required defaultValue={editingStudent?.name || ''} placeholder="Full Name" className="w-full border rounded-lg p-2 text-xs" />
              <select name="grade" defaultValue={editingStudent?.grade || '11th Grade'} className="w-full border rounded-lg p-2 text-xs">
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROSTER MODAL */}
      {isRosterModalOpen && selectedCourseForRoster && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900">{selectedCourseForRoster.name} Roster</h3>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {students.map(student => {
                const enrolled = isEnrolled(student.id, selectedCourseForRoster.id);
                return (
                  <div key={student.id} className="py-2 flex items-center justify-between text-xs">
                    <span>{student.name} ({student.grade})</span>
                    <button
                      onClick={() => toggleEnrollment(student.id, selectedCourseForRoster.id)}
                      className={`px-2.5 py-1 rounded font-semibold ${enrolled ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}
                    >
                      {enrolled ? 'Remove' : 'Enroll'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setIsRosterModalOpen(false)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}