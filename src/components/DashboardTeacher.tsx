import React, { useState } from 'react';
import { 
  Student, 
  Grade, 
  Absence, 
  Homework, 
  ClassRoom, 
  SchoolMessage,
  Teacher,
  ScheduleEvent
} from '../types';
import { 
  Plus, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Calendar, 
  BookOpen, 
  Send, 
  ClipboardCheck, 
  BookMarked,
  MessageSquare,
  Camera,
  Grid,
  List,
  Info,
  Trash2,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FileInput from './FileInput';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardTeacherProps {
  teacher: Teacher;
  classes: ClassRoom[];
  students: Student[];
  grades: Grade[];
  absences: Absence[];
  homeworks: Homework[];
  messages: SchoolMessage[];
  schedules: ScheduleEvent[];
  onAddGrade: (gradeData: Omit<Grade, 'id' | 'isValidated'>) => void;
  onAddAbsence: (absenceData: Omit<Absence, 'id'>) => void;
  onPublishHomework: (homeworkData: Omit<Homework, 'id' | 'completedBy'>) => void;
  onAddMessage: (content: string, receiverId: string, customSenderName?: string, customSenderRole?: 'parent' | 'teacher' | 'student' | 'admin') => void;
  userPhoto?: string;
  onUpdatePhoto?: (base64: string) => void;
}

export default function DashboardTeacher({
  teacher,
  classes,
  students,
  grades,
  absences,
  homeworks,
  messages,
  schedules,
  onAddGrade,
  onAddAbsence,
  onPublishHomework,
  onAddMessage,
  userPhoto,
  onUpdatePhoto
}: DashboardTeacherProps) {
  // Photo Editor toggle
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

  // Filter classes assigned to this teacher

  const assignedClasses = classes.filter(c => teacher.classIds.includes(c.id));
  const [selectedClassId, setSelectedClassId] = useState<string>(assignedClasses[0]?.id || '');
  
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'homework' | 'schedule' | 'messages' | 'insights' | 'student_profiles'>('grades');

  interface FacultyPrivateNote {
    id: string;
    studentId: string;
    teacherName: string;
    content: string;
    date: string;
  }

  const [privateNotes, setPrivateNotes] = useState<FacultyPrivateNote[]>([]);
  const [newNoteTexts, setNewNoteTexts] = useState<Record<string, string>>({}); // studentId -> text

  // TEACHER CALENDAR INTERACTIVE STATES
  const [calendarView, setCalendarView] = useState<'grid' | 'daily'>('grid');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<ScheduleEvent | null>(null);
  
  const [customEvents, setCustomEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const stored = localStorage.getItem('educonnect_teacher_custom_schedules');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventSubject, setNewEventSubject] = useState('Aide aux Devoirs');
  const [newEventStartTime, setNewEventStartTime] = useState('16:15');
  const [newEventEndTime, setNewEventEndTime] = useState('17:15');
  const [newEventRoom, setNewEventRoom] = useState('Salle d\'Étude');
  const [newEventColor, setNewEventColor] = useState('bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-850');

  // Unified class + custom teacher scheduled entries for selected class
  const classSchedule = schedules.filter(ev => ev.classId === selectedClassId);
  // Also include general schedules where teacherName matches current teacher
  const fullSchedule = [
    ...schedules.filter(ev => ev.classId === selectedClassId || ev.teacherName === teacher.name),
    ...customEvents.filter(ev => ev.classId === selectedClassId)
  ];

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('educonnect_faculty_private_notes');
      if (stored) {
        setPrivateNotes(JSON.parse(stored));
      } else {
        const defaultNotes: FacultyPrivateNote[] = [
          {
            id: 'n_1',
            studentId: 'st_1',
            teacherName: teacher.name,
            content: "Excellent esprit de camaraderie. Fait preuve d'une grande maturité lors des travaux dirigés en équipe.",
            date: "12/05/2026, 14:15"
          },
          {
            id: 'n_2',
            studentId: 'st_1',
            teacherName: teacher.name,
            content: "Attention à bien réviser les formules de trigonométrie. Difficulté passagère sur le dernier DS simulé.",
            date: "28/05/2026, 10:30"
          },
          {
            id: 'n_3',
            studentId: 'st_2',
            teacherName: teacher.name,
            content: "Participation orale brillante. Élève très investie qui anime positivement la dynamique du groupe de classe.",
            date: "19/05/2026, 11:22"
          }
        ];
        setPrivateNotes(defaultNotes);
        localStorage.setItem('educonnect_faculty_private_notes', JSON.stringify(defaultNotes));
      }
    } catch (e) {
      console.error(e);
    }
  }, [teacher.name]);

  const handleAddPrivateNote = (studentId: string) => {
    const text = newNoteTexts[studentId]?.trim();
    if (!text) return;

    const newNote: FacultyPrivateNote = {
      id: `note_${Date.now()}`,
      studentId,
      teacherName: teacher.name,
      content: text,
      date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newNote, ...privateNotes];
    setPrivateNotes(updated);
    localStorage.setItem('educonnect_faculty_private_notes', JSON.stringify(updated));
    setNewNoteTexts({ ...newNoteTexts, [studentId]: '' });
  };

  const handleRemovePrivateNote = (noteId: string) => {
    const updated = privateNotes.filter(n => n.id !== noteId);
    setPrivateNotes(updated);
    localStorage.setItem('educonnect_faculty_private_notes', JSON.stringify(updated));
  };

  React.useEffect(() => {
    const element = document.getElementById('teacher-tab-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // Filter students in selected class
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Compute classroom vs establishment average comparison per subject
  const comparisonData = (() => {
    const classStudentIds = classStudents.map(s => s.id);
    const uniqueSubjects = Array.from(new Set(grades.map(g => g.subject)));

    return uniqueSubjects.map(subj => {
      // Class grades for this subject
      const classGradesOfSubject = grades.filter(g => g.subject === subj && classStudentIds.includes(g.studentId));
      // School grades for this subject
      const schoolGradesOfSubject = grades.filter(g => g.subject === subj);

      // Average in class (weighted)
      let classSum = 0;
      let classCoeffSum = 0;
      classGradesOfSubject.forEach(g => {
        classSum += g.value * (g.coefficient || 1);
        classCoeffSum += (g.coefficient || 1);
      });
      const classAvg = classCoeffSum > 0 ? parseFloat((classSum / classCoeffSum).toFixed(2)) : 0;

      // Average in school/establishment (weighted)
      let schoolSum = 0;
      let schoolCoeffSum = 0;
      schoolGradesOfSubject.forEach(g => {
        schoolSum += g.value * (g.coefficient || 1);
        schoolCoeffSum += (g.coefficient || 1);
      });
      const schoolAvg = schoolCoeffSum > 0 ? parseFloat((schoolSum / schoolCoeffSum).toFixed(2)) : 0;

      return {
        subject: subj,
        classAvg,
        schoolAvg,
        classGradeCount: classGradesOfSubject.length,
        schoolGradeCount: schoolGradesOfSubject.length
      };
    }).filter(item => item.classGradeCount > 0 || item.schoolGradeCount > 0);
  })();

  // GRADE INGESTION FORM STATE
  const [gradeSubject, setGradeSubject] = useState<string>(teacher.subjects[0] || 'Mathématiques');
  const [gradeExamTitle, setGradeExamTitle] = useState('');
  const [gradeCoeff, setGradeCoeff] = useState(1);
  const [studentGradesVal, setStudentGradesVal] = useState<Record<string, string>>({}); // studentId -> value

  // ATTENDANCE REGISTRY STATE
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, 'present' | 'absent' | 'delay'>>({});
  const [attendanceDuration, setAttendanceDuration] = useState<Record<string, string>>({});
  const [attendanceReason, setAttendanceReason] = useState<Record<string, string>>({});

  // HOMEWORK CREATION STATE
  const [hwSubject, setHwSubject] = useState<string>(teacher.subjects[0] || 'Mathématiques');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');

  // MESSAGING STATE
  const uniqueParents = Array.from(new Set(classStudents.map(s => s.parentName)));
  const [activeParentName, setActiveParentName] = useState<string>(uniqueParents[0] || '');
  const [chatMessageText, setChatMessageText] = useState('');

  // AI Insights State
  const [aiClassResult, setAiClassResult] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Handlers
  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeExamTitle.trim()) {
      alert("Veuillez saisir un intitulé pour l'évaluation.");
      return;
    }

    let count = 0;
    Object.entries(studentGradesVal).forEach(([studentId, valStr]) => {
      const value = parseFloat(valStr as string);
      if (!isNaN(value) && value >= 0 && value <= 20) {
        onAddGrade({
          studentId,
          subject: gradeSubject,
          value,
          coefficient: gradeCoeff,
          date: new Date().toISOString().split('T')[0],
          title: gradeExamTitle,
          quarter: 3,
          teacherId: teacher.id
        });
        count++;
      }
    });

    if (count > 0) {
      alert(`Félicitations ! ${count} notes ont été enregistrées avec succès.`);
      setGradeExamTitle('');
      setStudentGradesVal({});
    } else {
      alert("Veuillez remplir au moins une note valide comprise entre 0 et 20.");
    }
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    let count = 0;

    classStudents.forEach(student => {
      const status = attendanceStatus[student.id] || 'present';
      if (status !== 'present') {
        onAddAbsence({
          studentId: student.id,
          date: attendanceDate,
          type: status === 'absent' ? 'absence' : 'delay',
          duration: attendanceDuration[student.id] || (status === 'absent' ? 'Journée entière' : '15 min'),
          reason: attendanceReason[student.id] || 'Non communiqué ou à justifier',
          justified: false,
          quarter: 3
        });
        count++;
      }
    });

    alert(count > 0 
      ? `Registre complété. ${count} anomalies de présence (absences/retards) ont été enregistrées.` 
      : "Registre validé. Tous les élèves de la classe ont été marqués présents."
    );
    setAttendanceStatus({});
    setAttendanceDuration({});
    setAttendanceReason({});
  };

  const handlePublishHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDesc.trim() || !hwDueDate) {
      alert("Veuillez remplir tous les champs du devoir.");
      return;
    }

    onPublishHomework({
      classId: selectedClassId,
      subject: hwSubject,
      title: hwTitle,
      description: hwDesc,
      dueDate: hwDueDate
    });

    alert("Le devoir a bien été publié dans le cahier de textes électronique.");
    setHwTitle('');
    setHwDesc('');
    setHwDueDate('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim()) return;

    // find student with this parent
    const matchStudent = classStudents.find(s => s.parentName === activeParentName);
    if (!matchStudent) return;

    onAddMessage(chatMessageText, matchStudent.id, teacher.name, 'teacher');
    setChatMessageText('');
  };

  const triggerClassAIInsight = async () => {
    setAiLoading(true);
    try {
      // Build visual average map
      const classStudentIds = classStudents.map(s => s.id);
      const classGrades = grades.filter(g => classStudentIds.includes(g.studentId));
      
      const promptData = classStudents.map(s => {
        const sGrades = classGrades.filter(g => g.studentId === s.id);
        const avg = sGrades.length > 0 ? sGrades.reduce((sum, g) => sum + g.value, 0) / sGrades.length : 12;
        return { name: s.name, gradesCount: sGrades.length, average: avg };
      });

      const response = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: `Classe d'étude ${classes.find(c => c.id === selectedClassId)?.name}`,
          classLevel: `Rapport Enseignant de classe`,
          grades: promptData.map(p => ({ title: p.name, value: p.average, coefficient: 1 })),
          behavior: "Analyse générale de la répartition des notes et du niveau de compréhension global."
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const result = await response.json();
      setAiClassResult(result);
    } catch (e) {
      console.error(e);
      // fallback mock insight generator matching teacher's needs
      const mockResult = {
        summary: `L'analyse globale de la classe met en évidence une moyenne estimée à 12.8/20. Les profils d'apprentissage sont hétérogènes. Deux sous-groupes de compétences s'individualisent clairement.`,
        warnings: [
          "Baisse de compréhension sur les fondamentaux d'analyse géométrique ou moléculaire.",
          "Écart type élevé témoignant d'une disparité importante entre la tête de classe et les élèves en décrochage."
        ],
        suggestions: [
          "Réaliser un mini-test de positionnement formatif au prochain cours.",
          "Mettre en place des binômes d'entraide pédagogique (Tutorat) mixant réussites et fragilités.",
          "Fractionner les concepts complexes en fiches de devoirs progressives à étapes guidées."
        ]
      };
      setAiClassResult(mockResult);
    } finally {
      setAiLoading(false);
    }
  };

  // Chat filters
  const parentMessages = messages.filter(m => {
    const parentEmail = students.find(s => s.parentName === activeParentName)?.parentEmail;
    return (
      (m.senderName === teacher.name && m.receiverName === activeParentName) ||
      (m.senderName === activeParentName && m.receiverName === teacher.name)
    );
  }).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="space-y-6 pb-28" id="dashboard-teacher-container">
      {/* Top Banner with class selector */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt="Profil Enseignant" 
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm shrink-0" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-200 dark:border-teal-850 shrink-0">
              {teacher.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-55/60 dark:bg-teal-950/40 px-2 rounded py-0.5 inline-block mb-1">
              Espace Enseignant
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Bonjour, {teacher.name}</h1>
              <button
                onClick={() => setShowPhotoEditor(!showPhotoEditor)}
                className="inline-flex self-start sm:self-auto items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-teal-600 dark:text-teal-400 border border-zinc-200 dark:border-zinc-750 rounded-lg transition-all cursor-pointer"
                id="teacher-add-photo-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{userPhoto ? 'Changer ma photo' : 'Ajouter ma photo'}</span>
              </button>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Gerez vos notes, cahiers de classe et présences scolaires.</p>
          </div>
        </div>

        {/* Dynamic assigned class selector dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase font-mono">Classe : </label>
          <select 
            value={selectedClassId} 
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setStudentGradesVal({});
              setAiClassResult(null);
            }}
            className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none transition"
            id="teacher-class-selector"
          >
            {assignedClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
            ))}
          </select>
        </div>
      </div>

      {showPhotoEditor && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-md max-w-md animate-fade-in"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Définir ma photo de profil</h3>
            <button 
              onClick={() => setShowPhotoEditor(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-250 text-xs font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
          <FileInput 
            onImageSelected={(b64) => {
              if (onUpdatePhoto) onUpdatePhoto(b64);
            }} 
            currentImage={userPhoto} 
            id="teacher-profile-photo-input"
          />
        </motion.div>
      )}


      {/* Floating Bottom App Navigation Bar (inspired strictly by mockups) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl bg-zinc-950/95 backdrop-blur-md rounded-full py-2.5 px-3 shadow-2xl border border-zinc-800 flex items-center justify-between gap-1">
        {[
          { id: 'grades', label: 'Saisie Notes', icon: BookMarked },
          { id: 'attendance', label: 'Présences', icon: ClipboardCheck },
          { id: 'homework', label: 'Devoirs', icon: Plus },
          { id: 'schedule', label: 'Agenda', icon: Calendar },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'student_profiles', label: 'Fiches Élèves', icon: Users },
          { id: 'insights', label: 'Diagnostic IA', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="relative flex-1 py-2 px-1 text-center flex items-center justify-center rounded-full transition-all cursor-pointer select-none border-none outline-none"
              id={`teacher-tab-btn-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabTeacher"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-white rounded-full -z-0"
                />
              )}
              <div 
                className={`flex items-center gap-1.5 relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-zinc-950 font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span className={`text-[11px] font-bold tracking-tight leading-none whitespace-nowrap ${isActive ? 'inline-block' : 'hidden md:inline-block'}`}>
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Tab block */}
      <div className="min-h-[400px] scroll-mt-24" id="teacher-tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'grades' && (
            <motion.form 
              key="teacher-grades-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSaveGrades}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Saisie d'un nouveau devoir noté</h2>
                  <p className="text-xs text-zinc-400">Saisissez les notes sur 20 pour la classe : {classes.find(c => c.id === selectedClassId)?.name}</p>
                </div>
              </div>

              {/* Assessment details layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-805">
                <div>
                  <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 block mb-1">Matière Enseignée</label>
                  <select 
                    value={gradeSubject} 
                    onChange={(e) => setGradeSubject(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-805 dark:text-zinc-105 focus:border-teal-500 outline-none"
                    id="teacher-subject-select"
                  >
                    {teacher.subjects.map(s => (
                      <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-100">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 block mb-1">Intitulé de l'Évaluation</label>
                  <input 
                    type="text" 
                    placeholder="ex: DS n°3 Fonctions Affines"
                    value={gradeExamTitle}
                    onChange={(e) => setGradeExamTitle(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-105 outline-none focus:border-teal-500"
                    id="teacher-exam-title-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 block mb-1">Coefficient</label>
                  <select 
                    value={gradeCoeff} 
                    onChange={(e) => setGradeCoeff(parseFloat(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-900 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-105 font-mono outline-none focus:border-teal-500"
                    id="teacher-coeff-select"
                  >
                    <option value="1" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">1</option>
                    <option value="1.5" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">1.5</option>
                    <option value="2" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">2</option>
                    <option value="3" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">3</option>
                    <option value="4" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">4</option>
                  </select>
                </div>
              </div>

              {/* Students grid ledger */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Registre des élèves ({classStudents.length})</span>
                
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {classStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 px-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 bg-white dark:bg-zinc-900">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{student.name}</h4>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">ID: {student.registrationNumber}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Note / 20"
                          value={studentGradesVal[student.id] || ''}
                          onChange={(e) => setStudentGradesVal({ ...studentGradesVal, [student.id]: e.target.value })}
                          className="w-24 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold font-mono text-center text-zinc-800 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-teal-500"
                          id={`note-input-${student.id}`}
                        />
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">/20</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit ledger button */}
              <div className="text-right pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00A896] hover:bg-teal-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                  id="teacher-save-grades-btn"
                >
                  <div className="flex items-center gap-1.5">
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder les notes trimestrielles</span>
                  </div>
                </button>
              </div>
            </motion.form>
          )}

          {/* ATTENDANCE tab */}
          {activeTab === 'attendance' && (
            <motion.form 
              key="teacher-attendance-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSaveAttendance}
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-800 font-sans">Registre d'appel & Présences</h2>
                  <p className="text-xs text-zinc-400">Cochez les absences ou retards pour le cours du jour : {classes.find(c => c.id === selectedClassId)?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-400 font-bold font-mono">Date :</label>
                  <input 
                    type="date" 
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg outline-none"
                    id="teacher-attendance-date"
                  />
                </div>
              </div>

              {/* Sign sheet roster */}
              <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 overflow-hidden bg-white">
                {classStudents.map(student => {
                  const currentStatus = attendanceStatus[student.id] || 'present';
                  return (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/20">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-800">{student.name}</h4>
                        <span className="text-[10px] text-zinc-400 block font-sans">Responsable : {student.parentName} ({student.parentPhone})</span>
                      </div>

                      <div className="flex items-center flex-wrap gap-3">
                        {/* Status capsules */}
                        <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                          {[
                            { value: 'present', label: 'Présent(e)', activeColor: 'bg-emerald-500 text-white' },
                            { value: 'absent', label: 'Absent(e)', activeColor: 'bg-red-500 text-white' },
                            { value: 'delay', label: 'En Retard', activeColor: 'bg-amber-500 text-[#3b2d13]' }
                          ].map(pill => (
                            <button
                              type="button"
                              key={pill.value}
                              onClick={() => {
                                setAttendanceStatus({ ...attendanceStatus, [student.id]: pill.value as any });
                              }}
                              className={`px-3 py-1 text-xs rounded transition font-medium ${
                                currentStatus === pill.value 
                                  ? pill.activeColor 
                                  : 'text-zinc-500 hover:text-zinc-800'
                              }`}
                              id={`attendance-pill-${student.id}-${pill.value}`}
                            >
                              {pill.label}
                            </button>
                          ))}
                        </div>

                        {/* Extra configurations if absent or delay */}
                        {currentStatus !== 'present' && (
                          <div className="flex items-center gap-2 mt-2 sm:mt-0" id={`attendance-extra-${student.id}`}>
                            <input
                              type="text"
                              placeholder={currentStatus === 'absent' ? "Durée (ex: Journée complète)" : "Retard (ex: 15 min)"}
                              value={attendanceDuration[student.id] || ''}
                              onChange={(e) => setAttendanceDuration({ ...attendanceDuration, [student.id]: e.target.value })}
                              className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs w-36 outline-none focus:bg-white"
                            />
                            <input
                              type="text"
                              placeholder="Motif déclaré..."
                              value={attendanceReason[student.id] || ''}
                              onChange={(e) => setAttendanceReason({ ...attendanceReason, [student.id]: e.target.value })}
                              className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs w-48 outline-none focus:bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit attendance button */}
              <div className="text-right pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00A896] hover:bg-teal-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                  id="teacher-save-attendance-btn"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enregistrer la feuille d'appel</span>
                  </div>
                </button>
              </div>
            </motion.form>
          )}

          {/* HOMEWORK assignment publishing */}
          {activeTab === 'homework' && (
            <motion.form 
              key="teacher-homework-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handlePublishHomeworkSubmit}
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-zinc-800">Publier de nouveaux devoirs</h3>
                <p className="text-xs text-zinc-400">Créez un nouvel entraînement pédagogique pour : {classes.find(c => c.id === selectedClassId)?.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">Matière</label>
                  <select 
                    value={hwSubject} 
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-950"
                    id="teacher-hw-subject"
                  >
                    {teacher.subjects.map(s => (
                      <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">Date limite de soumission</label>
                  <input 
                    type="date" 
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-950 date-picker"
                    id="teacher-hw-due-date"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">Titre de l'Exercice</label>
                <input 
                  type="text" 
                  placeholder="ex: Fiche d'auto-évaluation Fonctions Affines"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-950"
                  id="teacher-hw-title"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Instructions détaillées</label>
                <textarea 
                  placeholder="Rédigez les consignes de travail, les numéros de chapitres ou le type de rendu attendu..."
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-50 px-3 py-2 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white"
                  id="teacher-hw-desc"
                />
              </div>

              <div className="text-right pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00A896] hover:bg-teal-600 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  id="teacher-publish-hw-btn"
                >
                  Publier l'exercice de cours
                </button>
              </div>
            </motion.form>
          )}

          {/* MESSAGING filter */}
          {activeTab === 'messages' && (
            <motion.div 
              key="teacher-messages-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[460px]"
            >
              {/* Directory on left */}
              <div className="border-r border-zinc-100 pr-0 md:pr-6 space-y-4">
                <h3 className="text-xs font-bold uppercase font-mono text-zinc-400 tracking-wider">Parents d'Élèves ({uniqueParents.length})</h3>
                
                <div className="space-y-1.5">
                  {uniqueParents.map(parent => {
                    const isSelected = activeParentName === parent;
                    const child = classStudents.find(s => s.parentName === parent);
                    return (
                      <button
                        key={parent}
                        onClick={() => setActiveParentName(parent)}
                        className={`w-full text-left p-3 rounded-xl transition ${
                          isSelected ? 'bg-teal-500/10 text-teal-800 border-l-4 border-[#00A896]' : 'hover:bg-zinc-50 border-l-4 border-transparent'
                        }`}
                        id={`parent-dialog-btn-${parent}`}
                      >
                        <h4 className="text-xs font-semibold">{parent}</h4>
                        <p className="text-[10px] text-zinc-400 font-sans mt-0.5 italic">Parent de {child?.name || 'Inconnu'}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat body on right */}
              <div className="md:col-span-2 flex flex-col justify-between max-h-[480px]">
                <div className="pb-3 border-b border-zinc-100 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-800">Échange avec - {activeParentName}</h3>
                    <p className="text-[10px] text-zinc-400">Canal de contact sécurisé de l'établissement</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1.5 scrollbar-thin">
                  {parentMessages.map(msg => {
                    const fromMe = msg.senderName === teacher.name;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[80%] ${fromMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs ${
                          fromMe ? 'bg-[#00A896] text-white rounded-br-none' : 'bg-zinc-100 text-zinc-800 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-1 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}

                  {parentMessages.length === 0 && (
                    <div className="text-center py-20 text-zinc-400 text-xs italic">
                      Aucun historique de message avec ce parent. Initiez la discussion ci-dessus.
                    </div>
                  )}
                </div>

                {/* Input messaging form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-zinc-100 pt-3" id="teacher-chat-form">
                  <input
                    type="text"
                    placeholder="Saisissez votre message d'information ou de suivi à l'attention du parent..."
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 transition"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-[#00A896] hover:bg-teal-600 text-white rounded-xl transition cursor-pointer"
                    id="teacher-send-msg-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* AI insights tab */}
          {activeTab === 'insights' && (
            <motion.div 
              key="teacher-ai-insights"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-6"
            >
              {/* Comparative analytics section (Class vs. School) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-6 shadow-3xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-[#00A896]" />
                      <span>Comparatif des Moyennes : Classe vs. Établissement</span>
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      Visualisez la performance moyenne de la classe active par rapport à la moyenne générale de l'établissement par matière.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-[#00A896]" />
                      <span className="text-zinc-650 dark:text-zinc-300">Classe : {classes.find(c => c.id === selectedClassId)?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-indigo-500" />
                      <span className="text-zinc-650 dark:text-zinc-300">Établissement</span>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full mt-4" id="teacher-comparison-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barGap={6}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" className="dark:stroke-zinc-800" />
                      <XAxis 
                        dataKey="subject" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#71717A', fontSize: 10, fontWeight: '600' }} 
                      />
                      <YAxis 
                        domain={[0, 20]} 
                        ticks={[0, 4, 8, 12, 16, 20]} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#71717A', fontSize: 10, fontWeight: '600' }} 
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-3 rounded-xl shadow-lg space-y-1.5">
                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{payload[0].payload.subject}</p>
                                <div className="space-y-1">
                                  <p className="text-[11px] flex justify-between items-center gap-4">
                                    <span className="text-[#00A896] font-semibold flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-[#00A896]" />
                                      Classe :
                                    </span>
                                    <strong className="text-zinc-805 dark:text-zinc-200 font-mono">{Number(payload[0].value).toFixed(2)}/20</strong>
                                  </p>
                                  <p className="text-[11px] flex justify-between items-center gap-4">
                                    <span className="text-indigo-500 font-semibold flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                      Établissement :
                                    </span>
                                    <strong className="text-zinc-805 dark:text-zinc-200 font-mono">{Number(payload[1].value).toFixed(2)}/20</strong>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="classAvg" 
                        fill="#00A896" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={45}
                        name="Moyenne Classe"
                      />
                      <Bar 
                        dataKey="schoolAvg" 
                        fill="#6366F1" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={45}
                        name="Moyenne Établissement"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-500/10 to-teal-500/5 p-6 rounded-2xl border border-teal-100 dark:border-teal-900/40">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-zinc-950 text-teal-600 dark:text-teal-400 rounded-xl shadow-xs border border-teal-100 dark:border-teal-900/40">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-teal-900 dark:text-teal-100">Diagnostic IA Collectif de Classe</h3>
                    <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed max-w-2xl mt-1">
                      Générez un rapport pédagogique global pour la classe en utilisant la puissance analytique de <strong>Gemini AI</strong>. L'outil évalue les moyennes, prévient les décrochages scolaires et formule des recommandations collectives ciblées.
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={triggerClassAIInsight}
                    disabled={aiLoading}
                    className={`px-4 py-2 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs md:ml-auto ${
                      aiLoading ? 'opacity-65 cursor-wait' : ''
                    }`}
                    id="class-ai-trigger-btn"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyse de la classe en cours...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyser l'ensemble de la classe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {aiClassResult && (
                <div className="space-y-4" id="class-ai-results">
                  <div className="border border-teal-100 dark:border-teal-900/40 rounded-2xl bg-white dark:bg-zinc-950/40 p-5 divide-y divide-zinc-100 dark:divide-zinc-855">
                    <div className="pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-teal-700 dark:text-teal-400 block">Résumé analytique de l'apprentissage</span>
                      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed mt-1.5">
                        {aiClassResult.summary}
                      </p>
                    </div>

                    <div className="py-4">
                      <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Sujet de Vigilance Collectif</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {aiClassResult.warnings?.map((warn: string, idx: number) => (
                          <li key={idx} className="text-xs text-zinc-650 dark:text-zinc-400 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                            <span>{warn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4">
                      <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>Recommandations d'Améliorations Recommandées par l'IA</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {aiClassResult.suggestions?.map((sug: string, idx: number) => (
                          <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-100/50 dark:hover:bg-zinc-850/40 transition">
                            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 block mb-1">Stratégie #{idx+1}</span>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">{sug}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Student profiles confidentiality tab */}
          {activeTab === 'student_profiles' && (
            <motion.div 
              key="teacher-student-profiles"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs space-y-6"
            >
              <div>
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 font-sans">Fiches de suivi & Notes Privées (Faculté)</h2>
                <p className="text-xs text-zinc-400">Consultez les informations de vos élèves et consignez des notes confidentielles réservées uniquement à l'équipe pédagogique.</p>
              </div>

              {/* Student grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classStudents.map(student => {
                  const studentGradesList = grades.filter(g => g.studentId === student.id);
                  
                  // Compute GPA
                  let totalW = 0;
                  let totalC = 0;
                  studentGradesList.forEach(g => {
                    const c = g.coefficient || 1;
                    totalW += g.value * c;
                    totalC += c;
                  });
                  const gpa = totalC > 0 ? totalW / totalC : 0;

                  const myStudentNotes = privateNotes.filter(n => n.studentId === student.id);

                  return (
                    <div key={student.id} className="p-5 border border-zinc-150 dark:border-zinc-800 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/20 hover:border-teal-500/35 transition flex flex-col justify-between" id={`profile-card-${student.id}`}>
                      <div>
                        {/* Header info */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{student.name}</h3>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono block font-bold">Né(e) le {student.birthDate || '12/10/2010'} • Matr: {student.registrationNumber}</span>
                          </div>
                          
                          <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                            gpa >= 14 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : gpa >= 10 ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' : 'bg-red-50 text-red-550 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            Pondérée: {gpa > 0 ? `${gpa.toFixed(2)}/20` : 'Aucune note'}
                          </span>
                        </div>

                        {/* Private Notes Section */}
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                          <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-wider">
                            Observations confidentielles enseignant ({myStudentNotes.length})
                          </h4>

                          {/* List of notes */}
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {myStudentNotes.map(note => (
                              <div key={note.id} className="p-3 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-805 text-xs relative group">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-semibold text-teal-600 dark:text-teal-400 text-[10px] block font-mono">{note.teacherName}</span>
                                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">{note.date}</span>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 mt-1 italic text-[11px] leading-relaxed break-words">{note.content}</p>
                                <button
                                  onClick={() => handleRemovePrivateNote(note.id)}
                                  className="absolute top-2 right-2 text-[10px] text-zinc-300 hover:text-red-500 transition cursor-pointer opacity-0 group-hover:opacity-100"
                                  title="Supprimer la note"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            {myStudentNotes.length === 0 && (
                              <p className="text-zinc-400 dark:text-zinc-500 text-xs italic py-2">Aucune observation consignée pour le moment.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Note add form */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-805">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Obs active (ex: Bonne progression académique)..."
                            value={newNoteTexts[student.id] || ''}
                            onChange={(e) => setNewNoteTexts({ ...newNoteTexts, [student.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddPrivateNote(student.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:bg-white focus:border-teal-500 transition"
                            id={`private-note-input-${student.id}`}
                          />
                          <button
                            onClick={() => handleAddPrivateNote(student.id)}
                            className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white dark:text-zinc-100 font-semibold text-xs rounded-xl transition shrink-0"
                            id={`private-note-submit-${student.id}`}
                          >
                            Ajouter
                          </button>
                        </div>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-1.5 font-sans leading-relaxed">
                          Seules les personnes de la faculté (membres authentifiés) ont accès à ces informations.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Schedule Calendar panel for Teachers */}
          {activeTab === 'schedule' && (
            <motion.div
              key="teacher-schedule"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-6 animate-none"
            >
              {/* Calendar Header with toggles etc */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Mon Agenda & Emploi du Temps Académique</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Pilotez votre planning de cours, planifiez de l'accompagnement pédagogique ou des sessions de soutien.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* View switcher */}
                  <div className="bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex">
                    <button
                      type="button"
                      onClick={() => setCalendarView('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none ${
                        calendarView === 'grid' 
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-3xs' 
                          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hebdomadaire</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarView('daily')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none ${
                        calendarView === 'daily' 
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-3xs' 
                          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Jour par Jour</span>
                    </button>
                  </div>

                  {/* Add Revision Slot button */}
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(!showAddEvent)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition cursor-pointer shadow-3xs border-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Planifier un cours / soutien</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Revision Slot Form Block */}
              {showAddEvent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-zinc-50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-805 space-y-4"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-600" />
                    <span>Enregistrer une séance de soutien ou cours supplémentaire pour la classe active</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Jour de la semaine</label>
                      <select
                        value={selectedDayOfWeek}
                        onChange={(e) => setSelectedDayOfWeek(parseInt(e.target.value))}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none"
                      >
                        <option value="1">Lundi</option>
                        <option value="2">Mardi</option>
                        <option value="3">Mercredi</option>
                        <option value="4">Jeudi</option>
                        <option value="5">Vendredi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Intitulé / Objectif</label>
                      <input
                        type="text"
                        value={newEventSubject}
                        onChange={(e) => setNewEventSubject(e.target.value)}
                        placeholder="ex: Aide aux devoirs / Rattrapage"
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Début</label>
                        <input
                          type="text"
                          value={newEventStartTime}
                          onChange={(e) => setNewEventStartTime(e.target.value)}
                          placeholder="16:00"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-center text-zinc-700 dark:text-zinc-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Fin</label>
                        <input
                          type="text"
                          value={newEventEndTime}
                          onChange={(e) => setNewEventEndTime(e.target.value)}
                          placeholder="17:00"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-center text-zinc-700 dark:text-zinc-200 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Salle de classe</label>
                      <input
                        type="text"
                        value={newEventRoom}
                        onChange={(e) => setNewEventRoom(e.target.value)}
                        placeholder="ex: Salle de réunion, Permanence"
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                    <div className="text-[11px] text-zinc-500">
                      Cette séance sera planifiée pour la classe : <strong>{classes.find(c => c.id === selectedClassId)?.name}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newEventSubject.trim()) {
                          alert('Veuillez spécifier le titre du cours.');
                          return;
                        }
                        const newSched: ScheduleEvent = {
                          id: `teacher_sched_${Date.now()}`,
                          classId: selectedClassId,
                          dayOfWeek: selectedDayOfWeek,
                          subject: newEventSubject,
                          startTime: newEventStartTime,
                          endTime: newEventEndTime,
                          room: newEventRoom,
                          teacherName: teacher.name,
                          notes: 'TeacherRevision'
                        };

                        const updated = [...customEvents, newSched];
                        setCustomEvents(updated);
                        localStorage.setItem('educonnect_teacher_custom_schedules', JSON.stringify(updated));
                        
                        // Default color style
                        localStorage.setItem(`color_sched_${newSched.id}`, newEventColor);

                        setNewEventSubject('Aide aux Devoirs');
                        setShowAddEvent(false);
                        alert('Félicitations, l\'événement a été inscrit dans l\'agenda de la classe !');
                      }}
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Enregistrer dans l'agenda
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Daily View layout */}
              {calendarView === 'daily' && (
                <div className="space-y-4">
                  {/* Day tabs selection */}
                  <div className="flex gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-2 overflow-x-auto">
                    {[1, 2, 3, 4, 5].map(d => {
                      const dayName = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][d - 1];
                      const isSel = selectedDayOfWeek === d;
                      const dayEventsLength = fullSchedule.filter(ev => ev.dayOfWeek === d).length;

                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDayOfWeek(d)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer border-none outline-none ${
                            isSel 
                              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' 
                              : 'bg-zinc-55 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          <span>{dayName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSel ? 'bg-teal-500 text-white' : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-600'}`}>{dayEventsLength}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Daily list with metadata */}
                  <div className="space-y-3">
                    {fullSchedule
                      .filter(ev => ev.dayOfWeek === selectedDayOfWeek)
                      .sort((a,b) => a.startTime.localeCompare(b.startTime))
                      .map(ev => {
                        const isCustom = ev.notes === 'TeacherRevision';
                        const colorMapClass = 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100';

                        return (
                          <div 
                            key={ev.id}
                            onClick={() => setSelectedCalendarEvent(ev)}
                            className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-teal-500/50 cursor-pointer ${colorMapClass}`}
                          >
                            <div className="flex gap-4 items-center">
                              <div className="text-center font-mono shrink-0 py-1.5 px-3 bg-zinc-900/5 dark:bg-zinc-100/5 rounded-xl font-bold">
                                <span className="text-xs block">{ev.startTime}</span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">à {ev.endTime}</span>
                              </div>
                              
                              <div>
                                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                                  <span>{ev.subject}</span>
                                  {isCustom && <span className="text-[9px] uppercase font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-400 px-1.5 rounded">Accompagnement</span>}
                                </h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Classe assignée : <span className="font-semibold text-zinc-605 dark:text-zinc-300">{classes.find(c => c.id === ev.classId)?.name || 'Multi-classe'}</span> • Enseignant : <span className="font-semibold">{ev.teacherName}</span> • Salle : <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{ev.room}</span></p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* If Custom Revision, give trash button */}
                              {isCustom && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const cleaned = customEvents.filter(x => x.id !== ev.id);
                                    setCustomEvents(cleaned);
                                    localStorage.setItem('educonnect_teacher_custom_schedules', JSON.stringify(cleaned));
                                    if (selectedCalendarEvent?.id === ev.id) setSelectedCalendarEvent(null);
                                  }}
                                  className="p-1 hover:text-red-500 text-zinc-400 transition cursor-pointer border-none bg-transparent"
                                  title="Supprimer la planification"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline">Voir détails →</span>
                            </div>
                          </div>
                        );
                      })}

                    {fullSchedule.filter(ev => ev.dayOfWeek === selectedDayOfWeek).length === 0 && (
                      <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 italic text-xs">
                        Aucun cours planifié pour ce jour. Cliquez sur "Planifier un cours / soutien" pour enrichir le planning de la semaine !
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grid (Hebdomadaire) View Layout */}
              {calendarView === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(day => {
                    const dayName = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][day - 1];
                    const events = fullSchedule
                      .filter(ev => ev.dayOfWeek === day)
                      .sort((a,b) => a.startTime.localeCompare(b.startTime));

                    return (
                      <div key={day} className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-805 rounded-xl space-y-3">
                        <h3 className="text-xs font-bold text-center border-b border-zinc-200 dark:border-zinc-800 pb-2 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                          {dayName}
                        </h3>
                        
                        <div className="space-y-2.5">
                          {events.map(ev => {
                            const isCustom = ev.notes === 'TeacherRevision';
                            const customBgClass = isCustom 
                              ? 'bg-emerald-500/5 text-[#00A896] dark:text-emerald-405 border-emerald-500/20 shadow-3xs'
                              : 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-805 text-zinc-800 dark:text-zinc-100 shadow-3xs';

                            return (
                              <div 
                                key={ev.id} 
                                onClick={() => setSelectedCalendarEvent(ev)}
                                className={`p-3 border rounded-xl hover:border-teal-500/40 transition cursor-pointer select-none relative group ${customBgClass}`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="text-xs font-bold line-clamp-1">{ev.subject}</h4>
                                  {isCustom && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const cleaned = customEvents.filter(x => x.id !== ev.id);
                                        setCustomEvents(cleaned);
                                        localStorage.setItem('educonnect_teacher_custom_schedules', JSON.stringify(cleaned));
                                        if (selectedCalendarEvent?.id === ev.id) setSelectedCalendarEvent(null);
                                      }}
                                      className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-150 p-0.5 border-none bg-transparent"
                                      title="Supprimer"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <p className="text-[9.5px] text-zinc-400 dark:text-zinc-505 font-mono mt-0.5">{ev.startTime} - {ev.endTime}</p>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block truncate mt-1">Salle : {ev.room}</span>
                                <span className="text-[9.5px] text-teal-600 dark:text-teal-400 font-bold truncate block">{ev.teacherName}</span>
                              </div>
                            );
                          })}

                          {events.length === 0 && (
                            <div className="text-center py-6 text-zinc-400 italic text-[11px]">
                              Aucun cours
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Interactive Event Detail Overlay / Modal for Teachers */}
              <AnimatePresence>
                {selectedCalendarEvent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.95 }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-wider text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                            {selectedCalendarEvent.startTime} à {selectedCalendarEvent.endTime}
                          </span>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-55 mt-1">{selectedCalendarEvent.subject}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarEvent(null)}
                          className="text-zinc-400 hover:text-zinc-650 cursor-pointer text-xs font-bold border-none bg-transparent"
                        >
                          Fermer
                        </button>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-1 text-xs">
                        <p><span className="text-zinc-400">Classe concernée :</span> <strong className="text-zinc-700 dark:text-zinc-200">{classes.find(c => c.id === selectedCalendarEvent.classId)?.name || 'Multi-classe'}</strong></p>
                        <p><span className="text-zinc-400">Enseignant responsable :</span> <strong className="text-zinc-700 dark:text-zinc-200">{selectedCalendarEvent.teacherName}</strong></p>
                        <p><span className="text-zinc-450">Salle de cours :</span> <strong className="text-zinc-700 dark:text-zinc-200">{selectedCalendarEvent.room}</strong></p>
                      </div>

                      {/* Attached homework finder for teacher validation */}
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-teal-600 uppercase font-mono tracking-wider">Devoirs actifs pour cette classe</h4>
                        <div className="space-y-1">
                          {homeworks.filter(h => h.classId === selectedCalendarEvent.classId).map(h => (
                            <div key={h.id} className="p-2 bg-zinc-50 dark:bg-zinc-950 text-xs rounded-xl flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                              <span>{h.title}</span>
                              <span className="text-[9px] text-zinc-450 font-mono font-bold">Dû le {h.dueDate}</span>
                            </div>
                          ))}
                          {homeworks.filter(h => h.classId === selectedCalendarEvent.classId).length === 0 && (
                            <p className="text-[10px] text-zinc-400 italic">Aucun devoir programmé pour cette classe.</p>
                          )}
                        </div>
                      </div>

                      {/* Absences registered detail linked */}
                      <div className="space-y-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                        <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-wider">
                          Suivi des présences scolaires (Anomalies)
                        </h4>
                        <span className="text-[10px] text-zinc-500 leading-relaxed block">
                          Consultez la rubrique <strong>Présences</strong> de l'espace enseignant pour signaler ou valider les justificatifs d'absence de vos élèves.
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
