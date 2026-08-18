import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
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
  CloudOff,
  Link2,
  Upload,
  Download,
  FileJson,
  Copy,
  CheckCircle2,
  FileText,
  GitMerge
} from 'lucide-react';

const getEnvVar = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    return "";
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

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'classconnect-app';

let db = null;
let auth = null;
if (isFirebaseConfigured) {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const DEFAULT_ADMIN_PASSCODE = getEnvVar("VITE_ADMIN_PASSWORD") || 'admin123';

const applyBlockLinksToCourses = (coursesList, blocksList) => {
  const linkMap = {};
  blocksList.forEach(b => {
    if (b.linkedBlockId) {
      if (!linkMap[b.id]) linkMap[b.id] = new Set();
      linkMap[b.id].add(b.linkedBlockId);

      if (!linkMap[b.linkedBlockId]) linkMap[b.linkedBlockId] = new Set();
      linkMap[b.linkedBlockId].add(b.id);
    }
  });

  return coursesList.map(course => {
    if (!course.blockIds || course.blockIds.length === 0) return course;
    const newBlockIds = new Set(course.blockIds);
    course.blockIds.forEach(bId => {
      if (linkMap[bId]) {
        linkMap[bId].forEach(linkedId => newBlockIds.add(linkedId));
      }
    });
    return { ...course, blockIds: Array.from(newBlockIds) };
  });
};

const INITIAL_BLOCKS = [
  { id: 'b_a1', day: 'A', name: 'Block 1', time: '08:00 AM - 09:20 AM', linkedBlockId: 'b_c1' },
  { id: 'b_a2', day: 'A', name: 'Block 2', time: '09:30 AM - 10:50 AM', linkedBlockId: 'b_c2' },
  { id: 'b_a3', day: 'A', name: 'Block 3', time: '11:00 AM - 12:20 PM', linkedBlockId: 'b_c3' },
  { id: 'b_a4', day: 'A', name: 'Block 4', time: '01:15 PM - 02:35 PM', linkedBlockId: '' },
  
  { id: 'b_b1', day: 'B', name: 'Block 1', time: '08:00 AM - 09:20 AM', linkedBlockId: 'b_c6' },
  { id: 'b_b2', day: 'B', name: 'Block 2', time: '09:30 AM - 10:50 AM', linkedBlockId: 'b_c7' },
  { id: 'b_b3', day: 'B', name: 'Block 3', time: '11:00 AM - 12:20 PM', linkedBlockId: 'b_c8' },
  { id: 'b_b4', day: 'B', name: 'Block 4', time: '01:15 PM - 02:35 PM', linkedBlockId: '' },
  
  { id: 'b_c1', day: 'C', name: 'Block 1', time: '08:00 AM - 08:50 AM', linkedBlockId: '' },
  { id: 'b_c2', day: 'C', name: 'Block 2', time: '08:55 AM - 09:45 AM', linkedBlockId: '' },
  { id: 'b_c3', day: 'C', name: 'Block 3', time: '09:50 AM - 10:40 AM', linkedBlockId: '' },
  { id: 'b_c4', day: 'C', name: 'Block 4', time: '10:45 AM - 11:35 AM', linkedBlockId: '' },
  { id: 'b_c5', day: 'C', name: 'Block 5', time: '11:40 AM - 12:15 PM', linkedBlockId: '' },
  { id: 'b_c6', day: 'C', name: 'Block 6', time: '12:20 PM - 01:10 PM', linkedBlockId: '' },
  { id: 'b_c7', day: 'C', name: 'Block 7', time: '01:15 PM - 02:05 PM', linkedBlockId: '' },
  { id: 'b_c8', day: 'C', name: 'Block 8', time: '02:10 PM - 03:00 PM', linkedBlockId: '' },
];

const INITIAL_COURSES = [
  { id: 'c1', code: 'MATH401', name: 'AP Calculus BC', blockIds: ['b_a1', 'b_b1', 'b_c1'], room: 'Room 204', teacher: 'Dr. Smith', color: 'bg-blue-500' },
  { id: 'c2', code: 'ENG301', name: 'Honors English 11', blockIds: ['b_a1', 'b_b1', 'b_c2'], room: 'Room 112', teacher: 'Ms. Vance', color: 'bg-purple-500' },
  { id: 'c3', code: 'SCI302', name: 'AP Physics C', blockIds: ['b_a2', 'b_b2', 'b_c3'], room: 'Lab 3', teacher: 'Mr. Davis', color: 'bg-emerald-500' },
  { id: 'c4', code: 'HIST201', name: 'US History', blockIds: ['b_a2', 'b_b2', 'b_c4'], room: 'Room 108', teacher: 'Mrs. Gable', color: 'bg-amber-500' },
  { id: 'c5', code: 'CS102', name: 'Computer Science A', blockIds: ['b_a3', 'b_b3', 'b_c6'], room: 'Lab 1', teacher: 'Mr. Turing', color: 'bg-indigo-500' },
  { id: 'c6', code: 'ART101', name: 'Studio Art II', blockIds: ['b_a3', 'b_b3', 'b_c7'], room: 'Art Studio', teacher: 'Ms. Monet', color: 'bg-rose-500' },
  { id: 'c7', code: 'SPAN301', name: 'Spanish III', blockIds: ['b_a4', 'b_b4'], room: 'Room 210', teacher: 'Sra. Rivera', color: 'bg-teal-500' },
  { id: 'c8', code: 'PE101', name: 'Fitness & Health', blockIds: ['b_a4', 'b_b4'], room: 'Gym A', teacher: 'Turner, K; Blicharz, A', color: 'bg-orange-500' },
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const [user, setUser] = useState(null);

  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [enrollments, setEnrollments] = useState(INITIAL_ENROLLMENTS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudError, setCloudError] = useState(null);

  const [activeTab, setActiveTab] = useState('finder');
  const [selectedDay, setSelectedDay] = useState('A');

  const [selectedStudentId, setSelectedStudentId] = useState('s1');
  const [compareStudentA, setCompareStudentA] = useState('s1');
  const [compareStudentB, setCompareStudentB] = useState('s2');

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedCourseForRoster, setSelectedCourseForRoster] = useState(null);

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlocksDay, setEditingBlocksDay] = useState('A');
  const [tempAllBlocks, setTempAllBlocks] = useState([]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [importError, setImportError] = useState('');
  const [pendingParsedSchedules, setPendingParsedSchedules] = useState(null);
  const [missingStudentNameInput, setMissingStudentNameInput] = useState('');
  const [missingStudentGradeInput, setMissingStudentGradeInput] = useState('11th Grade');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportJsonContent, setExportJsonContent] = useState('');
  const [exportStudentName, setExportStudentName] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Modal for teacher consolidation/merging
  const [isMergeTeacherModalOpen, setIsMergeTeacherModalOpen] = useState(false);
  const [targetTeacherToMerge, setTargetTeacherToMerge] = useState('');
  const [mergeNewNameInput, setMergeNewNameInput] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Firebase auth error:", err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !user) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'master_schedule');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.blocks) setBlocks(data.blocks);
        if (data.courses) setCourses(data.courses);
        if (data.students) setStudents(data.students);
        if (data.enrollments) setEnrollments(data.enrollments);
        setCloudError(null);
      } else {
        saveToCloud(INITIAL_BLOCKS, INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_ENROLLMENTS);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
      setCloudError(error.message);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (students.length > 0) {
      const selExists = students.some(s => s.id === selectedStudentId);
      if (!selExists) setSelectedStudentId(students[0].id);

      const aExists = students.some(s => s.id === compareStudentA);
      if (!aExists) setCompareStudentA(students[0].id);

      const bExists = students.some(s => s.id === compareStudentB);
      if (!bExists) setCompareStudentB(students.length > 1 ? students[1].id : students[0].id);
    }
  }, [students]);

  const saveToCloud = async (newBlocks, newCourses, newStudents, newEnrollments) => {
    if (!db || !user) return;
    setIsSyncing(true);
    setCloudError(null);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'master_schedule');
      await setDoc(docRef, {
        blocks: newBlocks,
        courses: newCourses,
        students: newStudents,
        enrollments: newEnrollments,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to sync changes to Firebase Cloud:", err);
      setCloudError(err.message || "Missing or insufficient permissions");
    } finally {
      setIsSyncing(false);
    }
  };

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

  const updateBlocks = (newBlocks) => {
    const syncedCourses = applyBlockLinksToCourses(courses, newBlocks);
    setBlocks(newBlocks);
    setCourses(syncedCourses);
    saveToCloud(newBlocks, syncedCourses, students, enrollments);
  };

  const updateAllScheduleData = (newBlocks, newCourses, newStudents, newEnrollments) => {
    const syncedCourses = applyBlockLinksToCourses(newCourses, newBlocks);
    setBlocks(newBlocks);
    setCourses(syncedCourses);
    setStudents(newStudents);
    setEnrollments(newEnrollments);
    saveToCloud(newBlocks, syncedCourses, newStudents, newEnrollments);
  };

  const handleMergeTeachers = (e) => {
    e.preventDefault();
    if (!isAdmin || !targetTeacherToMerge || !mergeNewNameInput) return;

    const trimmedOld = targetTeacherToMerge.trim();
    const trimmedNew = mergeNewNameInput.trim();

    if (!trimmedOld || !trimmedNew) return;

    const updatedCourses = courses.map(course => {
      if (!course.teacher) return course;

      const teacherTokens = course.teacher
        .split(';')
        .map(t => t.trim())
        .filter(Boolean);

      const hasOld = teacherTokens.some(t => t.toLowerCase() === trimmedOld.toLowerCase());
      if (!hasOld) return course;

      const newTeachersList = [];
      teacherTokens.forEach(t => {
        if (t.toLowerCase() === trimmedOld.toLowerCase()) {
          if (!newTeachersList.some(nt => nt.toLowerCase() === trimmedNew.toLowerCase())) {
            newTeachersList.push(trimmedNew);
          }
        } else {
          if (!newTeachersList.some(nt => nt.toLowerCase() === t.toLowerCase())) {
            newTeachersList.push(t);
          }
        }
      });

      return {
        ...course,
        teacher: newTeachersList.join('; ')
      };
    });

    updateCourses(updatedCourses);
    setIsMergeTeacherModalOpen(false);
    setTargetTeacherToMerge('');
    setMergeNewNameInput('');
  };

  const generateStudentScheduleJson = (studentId) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return null;

    const studentCourses = getStudentCourses(studentId);
    
    const scheduleObj = {
      "A Day": {},
      "B Day": {},
      "C Day": {}
    };

    ['A', 'B', 'C'].forEach(day => {
      const dayName = `${day} Day`;
      const dayBlocks = blocks.filter(b => b.day === day);
      
      dayBlocks.forEach((block, idx) => {
        const blockKey = block.name || `Block ${idx + 1}`;
        const course = studentCourses.find(c => c.blockIds && c.blockIds.includes(block.id));

        if (course) {
          scheduleObj[dayName][blockKey] = {
            "Class Name": course.name,
            "Class Code": course.code,
            "Room Location": course.room,
            "Teacher": course.teacher
          };
        } else {
          scheduleObj[dayName][blockKey] = {
            "Class Name": "Free / Unassigned",
            "Class Code": "N/A",
            "Room Location": "N/A",
            "Teacher": "N/A"
          };
        }
      });
    });

    return [
      {
        "studentName": targetStudent.name,
        "grade": targetStudent.grade,
        "schedule": scheduleObj
      }
    ];
  };

  const handleOpenExportModal = (studentId) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;
    const exportData = generateStudentScheduleJson(studentId);
    setExportStudentName(targetStudent.name);
    setExportJsonContent(JSON.stringify(exportData, null, 4));
    setCopiedSuccess(false);
    setIsExportModalOpen(true);
  };

  const handleCopyExportJson = () => {
    navigator.clipboard.writeText(exportJsonContent);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const executeScheduleImport = (importedEntries, manualStudentInfo = null) => {
    let currentBlocks = [...blocks];
    let currentCourses = [...courses];
    let currentStudents = [...students];
    let currentEnrollments = [...enrollments];

    const courseColors = [
      'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-orange-500'
    ];

    const avatarBgs = [
      'bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700',
      'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700',
      'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700'
    ];

    importedEntries.forEach((entry) => {
      let studentName = entry.studentName || entry.student_name || entry.name;
      let studentGrade = entry.grade || entry.gradeLevel || '11th Grade';

      if (!studentName && manualStudentInfo) {
        studentName = manualStudentInfo.name;
        studentGrade = manualStudentInfo.grade;
      }

      if (!studentName) {
        studentName = `Imported Student ${currentStudents.length + 1}`;
      }

      let studentObj = currentStudents.find(s => s.name.toLowerCase().trim() === studentName.toLowerCase().trim());
      if (!studentObj) {
        studentObj = {
          id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: studentName,
          grade: studentGrade,
          avatarBg: avatarBgs[Math.floor(Math.random() * avatarBgs.length)]
        };
        currentStudents.push(studentObj);
      }

      const scheduleData = entry.schedule || entry;
      const dayKeys = ['A Day', 'B Day', 'C Day'];

      dayKeys.forEach(dayKey => {
        if (!scheduleData[dayKey]) return;
        const dayLetter = dayKey.charAt(0).toUpperCase();
        const blockEntries = scheduleData[dayKey];

        Object.keys(blockEntries).forEach(blockKey => {
          const classInfo = blockEntries[blockKey];
          if (!classInfo || !classInfo["Class Name"] || classInfo["Class Name"] === "Free / Unassigned") return;

          const className = classInfo["Class Name"] || classInfo.name || "Untitled Class";
          const classCode = classInfo["Class Code"] || classInfo.code || "GEN101";
          const room = classInfo["Room Location"] || classInfo.room || "Room TBD";
          const teacher = classInfo["Teacher"] || classInfo.teacher || "Staff";

          let targetBlock = currentBlocks.find(b => 
            b.day === dayLetter && 
            (b.name.toLowerCase() === blockKey.toLowerCase() || b.name.toLowerCase() === `block ${blockKey.replace(/\D/g, '')}`.toLowerCase())
          );

          if (!targetBlock) {
            targetBlock = {
              id: `b_${dayLetter.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              day: dayLetter,
              name: blockKey,
              time: '08:00 AM - 09:00 AM',
              linkedBlockId: ''
            };
            currentBlocks.push(targetBlock);
          }

          const dayBlockIds = currentBlocks.filter(b => b.day === dayLetter).map(b => b.id);
          const isGenericCode = !classCode || classCode.toUpperCase() === "N/A" || classCode.toUpperCase() === "GEN101";

          let courseIdx = currentCourses.findIndex(c => {
            const sameCode = c.code && classCode && !isGenericCode && c.code.toLowerCase().trim() === classCode.toLowerCase().trim();
            const sameName = c.name && className && c.name.toLowerCase().trim() === className.toLowerCase().trim();
            
            const cTeachers = (c.teacher || '').split(';').map(t => t.trim().toLowerCase()).filter(Boolean);
            const importTeachers = (teacher || '').split(';').map(t => t.trim().toLowerCase()).filter(Boolean);
            const sameTeacher = cTeachers.some(ct => importTeachers.includes(ct)) || 
                              (c.teacher && teacher && c.teacher.toLowerCase().trim() === teacher.toLowerCase().trim());

            let isMatch = false;
            if (!isGenericCode && sameCode) {
              isMatch = true;
            } else if (sameName && sameTeacher) {
              isMatch = true;
            } else if (sameName && (!c.teacher || c.teacher === "Staff" || c.teacher === "N/A")) {
              isMatch = true;
            }

            if (!isMatch) return false;

            const existingBlockForDay = (c.blockIds || []).find(bId => dayBlockIds.includes(bId));
            if (existingBlockForDay && existingBlockForDay !== targetBlock.id) {
              return false;
            }

            return true;
          });

          let courseObj;
          if (courseIdx !== -1) {
            const existing = currentCourses[courseIdx];
            const updatedBlockIds = existing.blockIds ? [...existing.blockIds] : [];
            if (!updatedBlockIds.includes(targetBlock.id)) {
              updatedBlockIds.push(targetBlock.id);
            }
            courseObj = { ...existing, blockIds: updatedBlockIds };
            currentCourses[courseIdx] = courseObj;
          } else {
            const normalizedTeacher = (teacher || 'Staff')
              .split(';')
              .map(t => t.trim())
              .filter(Boolean)
              .join('; ');

            courseObj = {
              id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              code: classCode,
              name: className,
              room: room,
              teacher: normalizedTeacher || teacher || 'Staff',
              blockIds: [targetBlock.id],
              color: courseColors[Math.floor(Math.random() * courseColors.length)]
            };
            currentCourses.push(courseObj);
          }

          const alreadyEnrolled = currentEnrollments.some(e => e.studentId === studentObj.id && e.courseId === courseObj.id);
          if (!alreadyEnrolled) {
            currentEnrollments.push({
              studentId: studentObj.id,
              courseId: courseObj.id
            });
          }
        });
      });
    });

    updateAllScheduleData(currentBlocks, currentCourses, currentStudents, currentEnrollments);
    if (currentStudents.length > 0) {
      setSelectedStudentId(currentStudents[currentStudents.length - 1].id);
    }
    setIsImportModalOpen(false);
    setJsonInputText('');
    setPendingParsedSchedules(null);
    setImportError('');
  };

  const handleProcessImportSubmit = (e) => {
    e.preventDefault();
    setImportError('');

    try {
      const parsed = JSON.parse(jsonInputText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0) {
        setImportError("JSON array cannot be empty.");
        return;
      }

      const firstItem = items[0];
      const hasName = firstItem.studentName || firstItem.student_name || firstItem.name;

      if (!hasName) {
        setPendingParsedSchedules(items);
        setMissingStudentNameInput('');
      } else {
        executeScheduleImport(items);
      }
    } catch (err) {
      console.error("JSON parse error:", err);
      setImportError("Invalid JSON format. Please ensure valid JSON formatting.");
    }
  };

  const handleFinishMissingStudentImport = (e) => {
    e.preventDefault();
    if (!missingStudentNameInput.trim()) return;
    executeScheduleImport(pendingParsedSchedules, {
      name: missingStudentNameInput.trim(),
      grade: missingStudentGradeInput
    });
  };

  const handleOpenBlockModal = () => {
    setEditingBlocksDay(selectedDay);
    setTempAllBlocks(JSON.parse(JSON.stringify(blocks)));
    setIsBlockModalOpen(true);
  };

  const handleSwitchBlockEditDay = (day) => {
    setEditingBlocksDay(day);
  };

  const handleTempBlockChange = (id, field, value) => {
    setTempAllBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleAddBlockToTemp = () => {
    const currentDayBlocks = tempAllBlocks.filter(b => b.day === editingBlocksDay);
    const nextNum = currentDayBlocks.length + 1;
    const newBlock = {
      id: `b_${editingBlocksDay.toLowerCase()}_${Date.now()}`,
      day: editingBlocksDay,
      name: `Block ${nextNum}`,
      time: '08:00 AM - 09:00 AM',
      linkedBlockId: ''
    };
    setTempAllBlocks(prev => [...prev, newBlock]);
  };

  const handleRemoveBlockFromTemp = (id) => {
    setTempAllBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveBlockStructure = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateBlocks(tempAllBlocks);
    setIsBlockModalOpen(false);
  };

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

  const getDayBlocks = (day) => blocks.filter(b => b.day === day);

  const getStudentCourses = (studentId) => {
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
    return studentEnrollments
      .map(e => courses.find(c => c.id === e.courseId))
      .filter(Boolean);
  };

  const getCourseStudents = (courseId) => {
    const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
    return courseEnrollments
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
    const blockCourseIds = courses.filter(c => c.blockIds && c.blockIds.includes(blockId)).map(c => c.id);
    const filtered = enrollments.filter(e => !(e.studentId === studentId && blockCourseIds.includes(e.courseId)));
    
    const updated = newCourseId ? [...filtered, { studentId, courseId: newCourseId }] : filtered;
    updateEnrollments(updated);
  };

  const classmateSynergyList = useMemo(() => {
    if (!selectedStudentId) return [];
    
    const targetCourses = getStudentCourses(selectedStudentId).filter(
      c => c && c.name && !c.name.toLowerCase().includes('lunch')
    );
    const targetCourseIds = new Set(targetCourses.map(c => c.id));

    return students
      .filter(s => s.id !== selectedStudentId)
      .map(student => {
        const otherCourses = getStudentCourses(student.id).filter(
          c => c && c.name && !c.name.toLowerCase().includes('lunch')
        );
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

  const teacherDirectory = useMemo(() => {
    const teacherMap = {};
    courses.forEach(course => {
      const rawTeacherStr = course.teacher || 'Unassigned Staff';
      const individualTeachers = rawTeacherStr
        .split(';')
        .map(t => t.trim())
        .filter(Boolean);

      const teachersToList = individualTeachers.length > 0 ? individualTeachers : ['Unassigned Staff'];

      teachersToList.forEach(tName => {
        if (!teacherMap[tName]) {
          teacherMap[tName] = [];
        }
        if (!teacherMap[tName].some(c => c.id === course.id)) {
          teacherMap[tName].push(course);
        }
      });
    });

    return Object.keys(teacherMap)
      .sort()
      .map(teacherName => {
        const teacherCourses = teacherMap[teacherName];
        const allEnrolledStudentsMap = new Map();

        teacherCourses.forEach(c => {
          const enrolled = getCourseStudents(c.id);
          enrolled.forEach(s => allEnrolledStudentsMap.set(s.id, s));
        });

        return {
          name: teacherName,
          courses: teacherCourses,
          totalUniqueStudents: allEnrolledStudentsMap.size,
          studentsList: Array.from(allEnrolledStudentsMap.values())
        };
      });
  }, [courses, enrollments, students]);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleResetData = () => {
    if (!isAdmin) return;
    if (window.confirm("Reset schedule data back to default template?")) {
      setBlocks(INITIAL_BLOCKS);
      setCourses(INITIAL_COURSES);
      setStudents(INITIAL_STUDENTS);
      setEnrollments(INITIAL_ENROLLMENTS);
      saveToCloud(INITIAL_BLOCKS, INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_ENROLLMENTS);
    }
  };

  const handleClearAllClasses = () => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete ALL classes? Enrollments will also be cleared.")) {
      setCourses([]);
      setEnrollments([]);
      saveToCloud(blocks, [], students, []);
    }
  };

  const handleClearAllStudents = () => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to remove ALL students? Enrollments will also be cleared.")) {
      setStudents([]);
      setEnrollments([]);
      setSelectedStudentId('');
      saveToCloud(blocks, courses, [], []);
    }
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.target);
    
    const blockA = formData.get('blockA');
    const blockB = formData.get('blockB');
    const blockC = formData.get('blockC');
    let selectedBlocks = [blockA, blockB, blockC].filter(Boolean);

    const linkedSet = new Set(selectedBlocks);
    selectedBlocks.forEach(bId => {
      const bObj = blocks.find(b => b.id === bId);
      if (bObj && bObj.linkedBlockId) linkedSet.add(bObj.linkedBlockId);
      blocks.forEach(b => {
        if (b.linkedBlockId === bId) linkedSet.add(b.id);
      });
    });

    const rawTeacher = formData.get('teacher') || '';
    const formattedTeacher = rawTeacher
      .split(';')
      .map(t => t.trim())
      .filter(Boolean)
      .join('; ');

    const courseData = {
      id: editingCourse ? editingCourse.id : `c_${Date.now()}`,
      code: formData.get('code'),
      name: formData.get('name'),
      blockIds: Array.from(linkedSet),
      room: formData.get('room'),
      teacher: formattedTeacher || 'Staff',
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
      if (selectedStudentId === studentId) {
        setSelectedStudentId(newStudents.length > 0 ? newStudents[0].id : '');
      }
      saveToCloud(blocks, courses, newStudents, newEnrollments);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
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

          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
              {isSyncing ? (
                <span className="flex items-center gap-1 text-indigo-600 animate-pulse">
                  <Cloud className="w-3.5 h-3.5" /> Syncing...
                </span>
              ) : isFirebaseConfigured ? (
                <span className="flex items-center gap-1 text-emerald-600" title="Live database connected">
                  <Cloud className="w-3.5 h-3.5" /> Live Cloud Sync
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400" title="Local browser storage mode">
                  <CloudOff className="w-3.5 h-3.5" /> Local Mode
                </span>
              )}
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5 text-amber-600" /> Admin Mode
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
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Admin Unlock
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  title="Import Schedule JSON"
                >
                  <Upload className="w-3.5 h-3.5" /> Import JSON
                </button>
                <button
                  onClick={handleOpenBlockModal}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  title="Manage Block Schedule & Times"
                >
                  <Clock className="w-3.5 h-3.5" /> Blocks
                </button>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-1 sm:space-x-4">
            {[
              { id: 'finder', label: 'Classmate Finder', icon: Sparkles },
              { id: 'compare', label: 'Side-by-Side Compare', icon: Sliders },
              { id: 'grid', label: 'Master Schedule Grid', icon: Grid },
              { id: 'classes', label: `Classes (${courses.length})`, icon: BookOpen },
              { id: 'students', label: `Students (${students.length})`, icon: Users },
              { id: 'teachers', label: `Teachers (${teacherDirectory.length})`, icon: User },
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

          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 my-2">
            {['A', 'B', 'C'].map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedDay === day ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {day} Day
              </button>
            ))}
          </div>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {activeTab === 'finder' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ${currentStudent?.avatarBg || 'bg-slate-100 text-slate-700'}`}>
                  {currentStudent?.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Target Student ({selectedDay} Day Schedule)
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
                  <span className="text-xs text-slate-400 block font-medium">Classes Today</span>
                  <span className="text-lg font-bold text-slate-800">
                    {getStudentCourses(selectedStudentId).filter(c => c.blockIds && c.blockIds.some(bId => getDayBlocks(selectedDay).map(b=>b.id).includes(bId))).length} / {getDayBlocks(selectedDay).length} Blocks
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
                    {currentStudent?.name}'s {selectedDay} Day Schedule
                  </h2>
                  <span className="text-xs text-slate-500">Block Breakdown & Classmates</span>
                </div>

                <div className="space-y-3">
                  {getDayBlocks(selectedDay).map((block) => {
                    const studentCourses = getStudentCourses(selectedStudentId);
                    const course = studentCourses.find(c => c.blockIds && c.blockIds.includes(block.id));
                    const classmates = course ? getCourseStudents(course.id).filter(s => s.id !== selectedStudentId) : [];

                    return (
                      <div key={block.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {block.name}
                          </span>
                          <span className="text-slate-400 font-mono">{block.time}</span>
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
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    People in this section ({classmates.length}):
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
                                  <p className="text-xs text-slate-400 italic">No other students enrolled in this period.</p>
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

              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Shared Class Leaderboard
                  </h2>
                  <span className="text-xs text-slate-500">Excludes Lunch</span>
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

        {}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Direct Schedule Comparison ({selectedDay} Day)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
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

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                <span>{selectedDay} Day Block Comparison</span>
                {(() => {
                  const dayBlockIds = getDayBlocks(selectedDay).map(b => b.id);
                  const coursesA = getStudentCourses(compareStudentA).filter(c => c && c.blockIds && c.blockIds.some(id => dayBlockIds.includes(id)));
                  const coursesB = getStudentCourses(compareStudentB).filter(c => c && c.blockIds && c.blockIds.some(id => dayBlockIds.includes(id)));
                  
                  const matchCount = coursesA.filter(cA => {
                    if (cA.name && cA.name.toLowerCase().includes('lunch')) return false;
                    return coursesB.some(cB => cB.id === cA.id || (cB.code && cB.code === cA.code && cB.teacher === cA.teacher));
                  }).length;

                  return (
                    <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                      {matchCount} Academic Matches (Excludes Lunch)
                    </span>
                  );
                })()}
              </div>

              <div className="divide-y divide-slate-100">
                {getDayBlocks(selectedDay).map(block => {
                  const courseA = getStudentCourses(compareStudentA).find(c => c.blockIds && c.blockIds.includes(block.id));
                  const courseB = getStudentCourses(compareStudentB).find(c => c.blockIds && c.blockIds.includes(block.id));
                  const isSameClass = courseA && courseB && (courseA.id === courseB.id || (courseA.code && courseA.code === courseB.code && courseA.teacher === courseB.teacher));

                  return (
                    <div key={block.id} className={`p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center ${isSameClass ? 'bg-emerald-50/40' : ''}`}>
                      <div className="md:col-span-3 font-semibold text-xs text-slate-600">
                        <span className="block font-bold text-slate-800">{block.name}</span>
                        <span className="text-slate-400 font-mono">{block.time}</span>
                      </div>

                      <div className="md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        {courseA ? (
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{courseA.name}</span>
                            <span className="text-[11px] text-slate-500">{courseA.room} • {courseA.teacher}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Free Period</span>
                        )}
                      </div>

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

                      <div className="md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        {courseB ? (
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{courseB.name}</span>
                            <span className="text-[11px] text-slate-500">{courseB.room} • {courseB.teacher}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Free Period</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'grid' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Master Schedule Matrix ({selectedDay} Day)</h2>
                <p className="text-xs text-slate-500">Overview of all student block enrollments</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="p-4 min-w-[180px] sticky left-0 bg-slate-50 z-10">Student</th>
                    {getDayBlocks(selectedDay).map(b => (
                      <th key={b.id} className="p-4 min-w-[180px]">
                        <span className="font-bold text-slate-700 block">{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal font-mono">{b.time}</span>
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

                          {getDayBlocks(selectedDay).map(block => {
                            const course = studentCourses.find(c => c.blockIds && c.blockIds.includes(block.id));
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

        {}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Class Directory & Rosters</h2>
                <p className="text-xs text-slate-500">Manage subject offerings, teachers, meeting blocks, and rosters</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search classes, codes, teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                {isAdmin && (
                  <>
                    <button
                      onClick={handleClearAllClasses}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Delete All Classes"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All Classes
                    </button>
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-4 h-4" /> Import JSON
                    </button>
                    <button
                      onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Create New Class
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
                {courses
                  .filter(c => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.room.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(course => {
                  const enrolled = getCourseStudents(course.id);
                  const assignedBlockObjs = blocks.filter(b => course.blockIds && course.blockIds.includes(b.id));

                  return (
                    <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                        <div>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {assignedBlockObjs.map(b => (
                              <span key={b.id} className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                {b.day}: {b.name}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{course.name}</h3>
                          <span className="text-xs font-mono text-slate-500">{course.code}</span>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md"
                              title="Edit Class Info"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                              title="Delete Class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 space-y-3">
                        <div className="text-xs space-y-1 text-slate-600">
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {course.room}</p>
                          <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> {course.teacher ? course.teacher.replace(/;/g, ', ') : 'Staff'}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-slate-700">Enrolled Roster ({enrolled.length})</span>
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
          </div>
        )}

        {}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Student Directory</h2>
                <p className="text-xs text-slate-500">Edit student details, export schedule JSON, and assign block classes</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students or grades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                {isAdmin && (
                  <>
                    <button
                      onClick={handleClearAllStudents}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Remove All Students"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All Students
                    </button>
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-4 h-4" /> Import Schedule JSON
                    </button>
                    <button
                      onClick={() => { setEditingStudent(null); setIsStudentModalOpen(true); }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add New Student
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {students
                  .filter(s => 
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    s.grade.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(student => {
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
                            onClick={() => handleOpenExportModal(student.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md"
                            title="Export Schedule JSON"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => { setEditingStudent(student); setIsStudentModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md"
                              title="Edit Student Name & Grade"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedStudentId(student.id); setActiveTab('finder'); }}
                            className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 font-semibold rounded-md hover:bg-indigo-100"
                          >
                            View Schedule
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                              title="Remove Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                            Schedule Builder ({selectedDay} Day)
                          </span>
                          <span className="text-[10px] text-slate-400">Use header toggle for A/B/C Days</span>
                        </div>

                        {getDayBlocks(selectedDay).map(block => {
                          const currentCourse = studentCourses.find(c => c.blockIds && c.blockIds.includes(block.id));
                          const availableCourses = courses.filter(c => c.blockIds && c.blockIds.includes(block.id));

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
          </div>
        )}

        {}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Teacher Directory</h2>
                <p className="text-xs text-slate-500">View teacher class assignments, schedules, and consolidate duplicate profiles</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter teachers or subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setTargetTeacherToMerge('');
                      setMergeNewNameInput('');
                      setIsMergeTeacherModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                    title="Merge two teacher profiles into one"
                  >
                    <GitMerge className="w-3.5 h-3.5" /> Combine Teachers
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {teacherDirectory
                  .filter(t => 
                    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.courses.some(c => 
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.code.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  )
                  .map(teacher => (
                    <div key={teacher.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base">{teacher.name}</h3>
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    setTargetTeacherToMerge(teacher.name);
                                    setMergeNewNameInput(teacher.name);
                                    setIsMergeTeacherModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                                  title="Rename or Combine this teacher"
                                >
                                  <GitMerge className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{teacher.courses.length} Course Section{teacher.courses.length === 1 ? '' : 's'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                          {teacher.totalUniqueStudents} Unique Student{teacher.totalUniqueStudents === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {teacher.courses.map(course => {
                          const courseStudents = getCourseStudents(course.id);
                          const assignedBlocks = blocks.filter(b => course.blockIds && course.blockIds.includes(b.id));

                          return (
                            <div key={course.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${course.color}`} />
                                    <h4 className="font-bold text-slate-900 text-sm">{course.name}</h4>
                                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border text-slate-500 font-medium">
                                      {course.code}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {course.room}</span>
                                    <div className="flex flex-wrap gap-1">
                                      {assignedBlocks.map(b => (
                                        <span key={b.id} className="text-[9px] font-bold text-indigo-700 bg-indigo-100/60 px-1 py-0.2 rounded">
                                          {b.day}-{b.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border">
                                  {courseStudents.length} Students
                                </span>
                              </div>

                              <div className="pt-2 border-t border-slate-200/60">
                                {courseStudents.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {courseStudents.map(s => (
                                      <button
                                        key={s.id}
                                        onClick={() => { setSelectedStudentId(s.id); setActiveTab('finder'); }}
                                        className="text-[11px] bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200 transition"
                                        title={`View ${s.name}'s schedule`}
                                      >
                                        {s.name}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-400 italic">No students currently enrolled in this section.</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {}
      {isMergeTeacherModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <GitMerge className="w-5 h-5 text-indigo-600" /> Combine Teacher Profiles
              </div>
              <button onClick={() => setIsMergeTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-500 leading-relaxed">
              Consolidate duplicate teacher profiles (e.g. merging an abbreviated name like <strong>"Turner, K"</strong> into <strong>"Turner, Keith"</strong>).
            </p>

            <form onSubmit={handleMergeTeachers} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Source / Duplicate Teacher Name</label>
                <input
                  type="text"
                  required
                  list="teacher-sources-list"
                  value={targetTeacherToMerge}
                  onChange={(e) => setTargetTeacherToMerge(e.target.value)}
                  placeholder="e.g. Turner, K"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
                <datalist id="teacher-sources-list">
                  {teacherDirectory.map(t => (
                    <option key={t.name} value={t.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Primary Teacher Name (Canonical Name)</label>
                <input
                  type="text"
                  required
                  list="teacher-targets-list"
                  value={mergeNewNameInput}
                  onChange={(e) => setMergeNewNameInput(e.target.value)}
                  placeholder="e.g. Turner, Keith"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
                <datalist id="teacher-targets-list">
                  {teacherDirectory.map(t => (
                    <option key={t.name} value={t.name} />
                  ))}
                </datalist>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                <p className="font-semibold flex items-center gap-1 mb-0.5">
                  <Info className="w-3.5 h-3.5 text-amber-600" /> Note
                </p>
                All course sections assigned to "{targetTeacherToMerge || 'Source'}" will be updated to point to "{mergeNewNameInput || 'Target'}".
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsMergeTeacherModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <GitMerge className="w-3.5 h-3.5" /> Save & Combine Profiles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 text-xs border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <FileJson className="w-5 h-5 text-emerald-600" /> Import Schedule JSON
              </div>
              <button onClick={() => { setIsImportModalOpen(false); setPendingParsedSchedules(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!pendingParsedSchedules ? (
              <form onSubmit={handleProcessImportSubmit} className="space-y-4">
                <p className="text-slate-500">
                  Paste the JSON schedule text or upload a `.json` file below. Classes will be deduplicated automatically.
                </p>

                <div>
                  <textarea
                    rows={10}
                    value={jsonInputText}
                    onChange={(e) => setJsonInputText(e.target.value)}
                    placeholder='Paste JSON here, e.g. [{"schedule": {"A Day": {"Block 1": {"Class Name": "AP Precalculus", "Class Code": "M58-001", "Room Location": "201", "Teacher": "Reza, Akash"}}}}]'
                    className="w-full font-mono text-[11px] border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  {importError && (
                    <p className="text-rose-600 mt-1 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> {importError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Upload JSON File
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => setJsonInputText(event.target?.result || '');
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                    >
                      Import & Deduplicate
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleFinishMissingStudentImport} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                  <p className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                    <Info className="w-4 h-4 text-amber-600" /> Student Info Missing from JSON
                  </p>
                  <p className="text-[11px]">
                    The schedule data was successfully parsed, but does not specify a student name. Enter student details below to complete the enrollment:
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={missingStudentNameInput}
                    onChange={(e) => setMissingStudentNameInput(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade Level</label>
                  <select
                    value={missingStudentGradeInput}
                    onChange={(e) => setMissingStudentGradeInput(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="9th Grade">9th Grade</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="11th Grade">11th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setPendingParsedSchedules(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    Save & Finish Import
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 text-xs border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <FileText className="w-5 h-5 text-indigo-600" /> Export {exportStudentName}'s Schedule
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-500">
              Below is the structured JSON output for {exportStudentName}'s schedule across A, B, and C Days.
            </p>

            <textarea
              rows={12}
              readOnly
              value={exportJsonContent}
              className="w-full font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([exportJsonContent], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${exportStudentName.replace(/\s+/g, '_')}_Schedule.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download .JSON
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyExportJson}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  {copiedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedSuccess ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Enter the admin passcode to modify classes, student rosters, and schedule block structures.
            </p>

            <form onSubmit={handleUnlockAdmin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter secret admin passcode"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Invalid passcode credential.
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBlockModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" /> Manage Schedule Blocks & Linkages
                </h3>
                <p className="text-slate-500 text-[11px]">Configure blocks and link periods across days</p>
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl">
              {['A', 'B', 'C'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSwitchBlockEditDay(day)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    editingBlocksDay === day ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {day} Day ({tempAllBlocks.filter(b => b.day === day).length})
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveBlockStructure} className="space-y-3">
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {tempAllBlocks.filter(b => b.day === editingBlocksDay).map((block, index) => (
                  <div key={block.id} className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border rounded-xl">
                    <span className="font-mono text-[10px] text-slate-400 font-bold w-4">{index + 1}.</span>
                    <input
                      type="text"
                      value={block.name}
                      onChange={(e) => handleTempBlockChange(block.id, 'name', e.target.value)}
                      placeholder="Block Name"
                      className="w-28 border rounded p-1.5 text-xs bg-white font-semibold"
                      required
                    />
                    <input
                      type="text"
                      value={block.time}
                      onChange={(e) => handleTempBlockChange(block.id, 'time', e.target.value)}
                      placeholder="e.g. 08:00 AM - 09:15 AM"
                      className="w-40 border rounded p-1.5 text-xs bg-white font-mono"
                      required
                    />

                    <div className="flex-1 flex items-center gap-1 min-w-[140px] bg-white border rounded p-1">
                      <Link2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <select
                        value={block.linkedBlockId || ''}
                        onChange={(e) => handleTempBlockChange(block.id, 'linkedBlockId', e.target.value)}
                        className="w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="">No Link</option>
                        {tempAllBlocks
                          .filter(other => other.id !== block.id)
                          .map(other => (
                            <option key={other.id} value={other.id}>
                              Link to {other.day}-{other.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBlockFromTemp(block.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAddBlockToTemp}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Block to {editingBlocksDay} Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to clear all blocks for ${editingBlocksDay} Day?`)) {
                        setTempAllBlocks(prev => prev.filter(b => b.day !== editingBlocksDay));
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear {editingBlocksDay} Day Blocks
                  </button>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsBlockModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">Cancel</button>
                  <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm">Save Block Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCourseModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-lg text-slate-900">{editingCourse ? 'Edit Class Information' : 'Add New Class'}</h3>
            <form onSubmit={handleSaveCourse} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Class Name</label>
                <input name="name" required defaultValue={editingCourse?.name || ''} placeholder="e.g. AP Calculus BC" className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Course Code</label>
                  <input name="code" required defaultValue={editingCourse?.code || ''} placeholder="e.g. MATH401" className="w-full border rounded-lg p-2 text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Room</label>
                  <input name="room" required defaultValue={editingCourse?.room || ''} placeholder="e.g. Room 204" className="w-full border rounded-lg p-2 text-xs" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Teacher(s)</label>
                <input name="teacher" required defaultValue={editingCourse?.teacher || ''} placeholder="e.g. Dr. Smith; Ms. Vance" className="w-full border rounded-lg p-2 text-xs" />
                <p className="text-[10px] text-slate-400 mt-0.5">Separate co-teachers with a semicolon ';' (e.g. Turner, Keith; Blicharz, Adam)</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-800">Schedule Meeting Blocks (A, B, C Days)</label>
                <p className="text-[11px] text-slate-400">Select which block period this class meets on each day:</p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700 w-16">A Day:</span>
                    <select name="blockA" defaultValue={editingCourse?.blockIds?.find(id=>id.startsWith('b_a')) || ''} className="flex-1 border rounded p-1.5 text-xs">
                      <option value="">-- No A Day Class --</option>
                      {getDayBlocks('A').map(b => <option key={b.id} value={b.id}>{b.name} ({b.time})</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700 w-16">B Day:</span>
                    <select name="blockB" defaultValue={editingCourse?.blockIds?.find(id=>id.startsWith('b_b')) || ''} className="flex-1 border rounded p-1.5 text-xs">
                      <option value="">-- No B Day Class --</option>
                      {getDayBlocks('B').map(b => <option key={b.id} value={b.id}>{b.name} ({b.time})</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700 w-16">C Day:</span>
                    <select name="blockC" defaultValue={editingCourse?.blockIds?.find(id=>id.startsWith('b_c')) || ''} className="flex-1 border rounded p-1.5 text-xs">
                      <option value="">-- No C Day Class --</option>
                      {getDayBlocks('C').map(b => <option key={b.id} value={b.id}>{b.name} ({b.time})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">Save Class Info</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudentModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-lg text-slate-900">{editingStudent ? 'Edit Student Details' : 'Add New Student'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
                <input name="name" required defaultValue={editingStudent?.name || ''} placeholder="Full Name" className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Grade Level</label>
                <select name="grade" defaultValue={editingStudent?.grade || '11th Grade'} className="w-full border rounded-lg p-2 text-xs">
                  <option value="9th Grade">9th Grade</option>
                  <option value="10th Grade">10th Grade</option>
                  <option value="11th Grade">11th Grade</option>
                  <option value="12th Grade">12th Grade</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRosterModalOpen && selectedCourseForRoster && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedCourseForRoster.name}</h3>
                <p className="text-slate-500 font-mono text-[11px]">{selectedCourseForRoster.code} • {selectedCourseForRoster.teacher}</p>
              </div>
              <button onClick={() => setIsRosterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {students.map(student => {
                const enrolled = isEnrolled(student.id, selectedCourseForRoster.id);
                return (
                  <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                    <span className="font-semibold text-slate-800">{student.name} ({student.grade})</span>
                    <button
                      type="button"
                      onClick={() => toggleEnrollment(student.id, selectedCourseForRoster.id)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                        enrolled ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {enrolled ? 'Remove' : 'Enroll'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button type="button" onClick={() => setIsRosterModalOpen(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}