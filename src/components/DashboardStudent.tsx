import React, { useState } from 'react';
import { 
  Student, 
  Grade, 
  Homework, 
  ScheduleEvent 
} from '../types';
import { 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  Award, 
  Download, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Lightbulb,
  FileText,
  Camera,
  Plus,
  Trash2,
  Filter,
  Grid,
  List,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FileInput from './FileInput';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface DashboardStudentProps {
  student: Student;
  grades: Grade[];
  homeworks: Homework[];
  schedules: ScheduleEvent[];
  onToggleHomework: (homeworkId: string) => void;
  userPhoto?: string;
  onUpdatePhoto?: (base64: string) => void;
}

export default function DashboardStudent({
  student,
  grades,
  homeworks,
  schedules,
  onToggleHomework,
  userPhoto,
  onUpdatePhoto
}: DashboardStudentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'homework' | 'schedule'>('overview');
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [selectedFilterSubject, setSelectedFilterSubject] = useState<string>('all');
  const [newlyValidatedIds, setNewlyValidatedIds] = useState<string[]>([]);
  const [simulatedGrades, setSimulatedGrades] = useState<Array<{ id: string; subject: string; value: number; coefficient: number; title: string }>>([]);
  const [simSubject, setSimSubject] = useState('');
  const [simValue, setSimValue] = useState('15');
  const [simCoeff, setSimCoeff] = useState('2');
  const [simTitle, setSimTitle] = useState('Devoir Blanc Saisi');

  // CALENDAR/AGENDA INTERACTIVE STATES
  const [calendarView, setCalendarView] = useState<'grid' | 'daily'>('grid');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1); // Monday
  const [calendarSubjectFilter, setCalendarSubjectFilter] = useState<string>('all');
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<ScheduleEvent | null>(null);
  
  const [customEvents, setCustomEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const stored = localStorage.getItem('educonnect_custom_schedules');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [eventLogs, setEventLogs] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('educonnect_student_event_logs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [activeLogText, setActiveLogText] = useState('');

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventSubject, setNewEventSubject] = useState('Séance d\'Étude');
  const [newEventTeacherName, setNewEventTeacherName] = useState('Autonome');
  const [newEventStartTime, setNewEventStartTime] = useState('14:00');
  const [newEventEndTime, setNewEventEndTime] = useState('15:00');
  const [newEventRoom, setNewEventRoom] = useState('Permanence');
  const [newEventColor, setNewEventColor] = useState('bg-indigo-55/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850');

  // GRADE EVOLUTION RECHARTS FILTER STATE
  const [chartSubjectFilter, setChartSubjectFilter] = useState<string>('all');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('educonnect_newly_validated_grades');
      if (stored) {
        setNewlyValidatedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    const element = document.getElementById('student-tab-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // Filter student-specific records
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const classHomeworks = homeworks.filter(h => h.classId === student.classId);
  const classSchedule = schedules.filter(s => s.classId === student.classId);

  // Combine default schedule with user-simulated / custom study slots
  const fullSchedule = [...classSchedule, ...customEvents];

  // RECHARTS GRADE EVOLUTION DATAPOINTS
  const sortedQ3Grades = [...studentGrades]
    .filter(g => g.quarter === 3)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const uniqueQ3Dates = Array.from(new Set(sortedQ3Grades.map(g => g.date))).sort();
  
  const gradeEvolutionData = uniqueQ3Dates.map(dateStr => {
    const formattedDate = new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const dataPoint: any = {
      date: formattedDate,
      rawDate: dateStr,
    };

    // Roll academic averages up to this date
    const uniqueSubjects = Array.from(new Set(studentGrades.map(g => g.subject)));
    uniqueSubjects.forEach(subj => {
      const gradesToDate = sortedQ3Grades.filter(g => g.subject === subj && g.date <= dateStr);
      if (gradesToDate.length > 0) {
        const sum = gradesToDate.reduce((acc, current) => acc + current.value * (current.coefficient || 1), 0);
        const coeff = gradesToDate.reduce((acc, current) => acc + (current.coefficient || 1), 0);
        dataPoint[subj] = parseFloat((sum / coeff).toFixed(2));
      }
    });

    const allGradesToDate = sortedQ3Grades.filter(g => g.date <= dateStr);
    if (allGradesToDate.length > 0) {
      const sum = allGradesToDate.reduce((acc, current) => acc + current.value * (current.coefficient || 1), 0);
      const coeff = allGradesToDate.reduce((acc, current) => acc + (current.coefficient || 1), 0);
      dataPoint['Moyenne de Période'] = parseFloat((sum / coeff).toFixed(2));
    }

    return dataPoint;
  });

  // Group grades by subject to display averages (weighted)
  const subjects = Array.from(new Set(studentGrades.map(g => g.subject)));
  
  React.useEffect(() => {
    if (subjects.length > 0 && !simSubject) {
      setSimSubject(subjects[0]);
    }
  }, [subjects, simSubject]);

  // Real-time weighted average computation based on coefficients
  let totalWeightedScore = 0;
  let totalCoefficients = 0;
  
  studentGrades.forEach(g => {
    const coeff = g.coefficient || 1;
    totalWeightedScore += g.value * coeff;
    totalCoefficients += coeff;
  });

  // Calculate simulated ones
  let simWeightedScore = totalWeightedScore;
  let simCoefficients = totalCoefficients;
  
  simulatedGrades.forEach(g => {
    simWeightedScore += g.value * g.coefficient;
    simCoefficients += g.coefficient;
  });

  const generalAverage = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients : 0;
  const simulatedAverage = simCoefficients > 0 ? simWeightedScore / simCoefficients : 0;
  const gpaDelta = simulatedAverage - generalAverage;

  const subjectAverages = subjects.map(subj => {
    const list = studentGrades.filter(g => g.subject === subj);
    const totalWScore = list.reduce((acc, g) => acc + g.value * (g.coefficient || 1), 0);
    const totalCoeff = list.reduce((acc, g) => acc + (g.coefficient || 1), 0);
    return { 
      subject: subj, 
      average: totalCoeff > 0 ? totalWScore / totalCoeff : 0, 
      count: list.length 
    };
  });

  // Homework calculations
  const completedHomeworkCount = classHomeworks.filter(h => h.completedBy.includes(student.id)).length;
  const totalHomeworkCount = classHomeworks.length;
  const completionPercent = totalHomeworkCount > 0 
    ? Math.round((completedHomeworkCount / totalHomeworkCount) * 100) 
    : 100;

  // Quick motivating banner phrases based on performance
  let motivator = "Continue à t'exercer quotidiennement pour libérer ton plein potentiel !";
  if (generalAverage >= 16) {
    motivator = "Excellent parcours d'apprentissage ! Tes efforts et ta rigueur te guident vers la réussite.";
  } else if (generalAverage >= 13) {
    motivator = "De très bons résultats d'ensemble. Reste concentré et continue cette belle dynamique !";
  } else if (generalAverage < 10 && generalAverage > 0) {
    motivator = "Ne te décourage pas ! Relis tes fiches de cours régulièrement et pose des questions à tes professeurs.";
  }

  return (
    <div className="space-y-6 pb-28" id="dashboard-student-container">
      {/* Visual Student Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt="Profil Élève" 
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm shrink-0" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-200 dark:border-teal-850 shrink-0">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-55/60 dark:bg-teal-950/40 px-2 rounded-md py-1 inline-block mb-1">
              Espace Élève
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Salut, {student.name} !</h1>
              <button
                onClick={() => setShowPhotoEditor(!showPhotoEditor)}
                className="inline-flex self-start sm:self-auto items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-teal-600 dark:text-teal-400 border border-zinc-200 dark:border-zinc-750 rounded-lg transition-all cursor-pointer"
                id="student-add-photo-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{userPhoto ? 'Changer ma photo' : 'Ajouter ma photo'}</span>
              </button>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Prêt pour tes apprentissages du jour ? Trimestre 3 en cours.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-right">
            <span className="text-xs text-zinc-400 block font-mono">Ma Classe :</span>
            <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
              {student.classId === 'c1' ? '6ème A' : student.classId === 'c2' ? '5ème B' : student.classId === 'c3' ? '3ème Alpha' : 'Terminale S1'}
            </span>
          </div>
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
            id="student-profile-photo-input"
          />
        </motion.div>
      )}


      {/* Main stats indicators in the neat curved banking style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GPA Badge */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 block uppercase font-mono">Moyenne Générale</span>
            <span className="text-3xl font-bold text-teal-600 dark:text-teal-450 mt-1 block">
              {generalAverage > 0 ? generalAverage.toFixed(2) : '--'}/20
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-550 block mt-1">Calculée sur {studentGrades.length} examens</span>
          </div>
          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Homework stats */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 block uppercase font-mono">Devoirs Terminés</span>
            <span className="text-3xl font-bold text-[#00A896] dark:text-teal-400 mt-1 block">
              {completedHomeworkCount} / {totalHomeworkCount}
            </span>
            {/* Completion rate progress bar */}
            <div className="w-32 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-teal-500 dark:bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
            <CheckSquare className="w-8 h-8" />
          </div>
        </div>

        {/* Attendance card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 block uppercase font-mono font-sans text-amber-700 dark:text-amber-500">Motivation & Objectifs</span>
            <p className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed mt-2 italic font-serif">
              "{motivator}"
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Floating Bottom App Navigation Bar (inspired strictly by mockups) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg bg-zinc-950/95 backdrop-blur-md rounded-full py-2.5 px-3 shadow-2xl border border-zinc-800 flex items-center justify-between gap-1">
        {[
          { id: 'overview', label: 'Accueil', icon: BookOpen },
          { id: 'notes', label: 'Notes', icon: Award },
          { id: 'homework', label: 'Devoirs', icon: CheckSquare },
          { id: 'schedule', label: 'Agenda', icon: Calendar }
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
              id={`student-tab-btn-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabStudent"
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

      {/* Tab Panels body */}
      <div className="min-h-[380px] scroll-mt-24" id="student-tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="student-overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Quick Homework and course material */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Cahier de Devoirs Actifs</h2>
                    <button 
                      onClick={() => setActiveTab('homework')} 
                      className="text-xs text-teal-600 dark:text-teal-450 font-semibold hover:underline"
                    >
                      Voir mes {classHomeworks.length} devoirs
                    </button>
                  </div>

                  <div className="space-y-3">
                    {classHomeworks.slice(0, 3).map(hw => {
                      const isCompleted = hw.completedBy.includes(student.id);
                      return (
                        <div 
                          key={hw.id}
                          className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40 transition cursor-pointer"
                          onClick={() => onToggleHomework(hw.id)}
                        >
                          <div className={`mt-0.5 p-2 rounded-lg transition-transform hover:scale-110 ${
                            isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                              {hw.subject}
                            </span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 block mt-1">Rendre avant le : <strong>{hw.dueDate}</strong></span>
                            <h4 className={`text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-1 ${isCompleted ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}`}>
                              {hw.title}
                            </h4>
                          </div>

                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-350' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-705 dark:text-rose-350'
                          }`}>
                            {isCompleted ? 'Terminé' : 'En attente'}
                          </span>
                        </div>
                      );
                    })}

                    {classHomeworks.length === 0 && (
                      <div className="text-center py-12 text-zinc-400">
                        Aucun devoir répertorié. Profites-en !
                      </div>
                    )}
                  </div>
                </div>

                {/* Course resources download zone */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Bibliothèque de Cours & Téléchargements</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Syllabus de Mathématiques - Algèbre.pdf", size: "1.2 MB", subject: "Mathématiques", date: "15/05/2026" },
                      { title: "Fiche d'exercice - Cycle de l'Eau.pdf", size: "840 KB", subject: "Sciences", date: "10/05/2026" },
                      { title: "Préparation Brevet - Dictées de révision.pdf", size: "1.5 MB", subject: "Français", date: "24/05/2026" }
                    ].map((doc, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-100/50 dark:hover:bg-zinc-850/50 transition">
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400 block mb-0.5">{doc.subject}</span>
                            <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-snug">{doc.title}</h4>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{doc.size} • Mis en ligne le {doc.date}</p>
                          </div>
                        </div>
                        <div className="text-right mt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2">
                          <button className="text-[11px] text-[#00A896] dark:text-teal-400 hover:text-teal-700 font-bold inline-flex items-center gap-1 cursor-pointer">
                            <Download className="w-3.5 h-3.5" />
                            <span>Télécharger</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Subject Progress panel */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
                    <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span>Progression par matière</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {subjectAverages.map(subj => {
                      // rating color block
                      let pct = (subj.average / 20) * 100;
                      return (
                        <div key={subj.subject} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-700 dark:text-zinc-300">{subj.subject}</span>
                            <span className="text-teal-600 dark:text-teal-400 font-bold font-mono">{subj.average.toFixed(1)}/20</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                subj.average >= 14 ? 'bg-emerald-500' : subj.average >= 10 ? 'bg-teal-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-400 block font-mono">{subj.count} évaluation(s) ce trimestre</span>
                        </div>
                      );
                    })}

                    {subjectAverages.length === 0 && (
                      <div className="text-center py-6 text-zinc-400 italic text-xs">
                        Aucun évaluation enregistrée.
                      </div>
                    )}
                  </div>
                </div>

                {/* Micro-learning checklist */}
                <div className="bg-gradient-to-tr from-teal-500 to-teal-700 text-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-sm font-bold">Objectifs Semaine 3</h3>
                  <p className="text-[11px] text-teal-100 mt-1 leading-relaxed">
                    Un agenda serré d'exercices d'apprentissage qui t'attendent !
                  </p>
                  
                  <ul className="mt-4 space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-none bg-teal-600 focus:ring-0 w-3.5 h-3.5" />
                      <span className="line-through text-teal-100">Soumettre le Schéma d'eau</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-none bg-teal-600 focus:ring-0 w-3.5 h-3.5" />
                      <span>Terminer exercice Thalès (Maths)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-none bg-teal-600 focus:ring-0 w-3.5 h-3.5" />
                      <span>Lire chapitres 3-5 Livre de la Jungle (Français)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notes display panel */}
          {activeTab === 'notes' && (
            <motion.div
              key="student-notes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-none"
            >
              {/* Full Width Grade Evolution Chart using Recharts */}
              <div className="col-span-1 lg:col-span-3 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-sans font-bold text-zinc-900 dark:text-zinc-50 text-base">Évolution Trimestrielle des Notes</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Évolution chronologique pondérée cumulée par matière sur le Trimestre 3</p>
                  </div>
                  
                  {/* Subject filter for the chart */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-bold uppercase font-mono">Filtre Matière :</span>
                    <select
                      value={chartSubjectFilter}
                      onChange={(e) => setChartSubjectFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none transition"
                    >
                      <option value="all">Toutes les Matières</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gradeEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" className="dark:stroke-zinc-800" />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#71717A', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        domain={[0, 20]} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#71717A', fontSize: 10, fontWeight: 'bold' }} 
                        ticks={[0, 5, 10, 15, 20]}
                      />
                      <Tooltip
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 p-3 rounded-2xl shadow-xl text-xs space-y-1 text-left">
                                <p className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">Moyennes au {label}</p>
                                {payload.map((p: any) => (
                                  <p key={p.name} className="flex justify-between items-center gap-4 text-zinc-650 dark:text-zinc-350">
                                    <span className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                      {p.name} :
                                    </span>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">{p.value.toFixed(1)}/20</span>
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: 11, fontWeight: 'bold', paddingTop: 10 }} 
                      />
                      
                      {chartSubjectFilter === 'all' ? (
                        <>
                          <Line 
                            type="monotone" 
                            dataKey="Moyenne de Période" 
                            name="Moyenne Générale" 
                            stroke="#00A896" 
                            strokeWidth={3} 
                            connectNulls={true}
                            dot={{ stroke: '#00A896', strokeWidth: 2, r: 4, fill: '#FFFFFF' }} 
                            activeDot={{ r: 6 }} 
                          />
                          {subjects.map((subj, idx) => {
                            const colors = ['#6366F1', '#3282F6', '#EC4899', '#F59E0B', '#10B981'];
                            return (
                              <Line 
                                key={subj}
                                type="monotone" 
                                dataKey={subj} 
                                name={subj} 
                                stroke={colors[idx % colors.length]} 
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                connectNulls={true}
                                dot={{ r: 2 }} 
                              />
                            );
                          })}
                        </>
                      ) : (
                        <Line 
                          type="monotone" 
                          dataKey={chartSubjectFilter} 
                          name={chartSubjectFilter} 
                          stroke="#6366F1" 
                          strokeWidth={3} 
                          connectNulls={true}
                          dot={{ stroke: '#6366F1', strokeWidth: 2, r: 4, fill: '#FFFFFF' }} 
                          activeDot={{ r: 6 }} 
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Left Column: Real validated and pending grades by subject */}
              <div className="lg:col-span-2 space-y-6">
                {/* Dynamic Subject Filter Selector */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">Filtrer mes bulletins</h4>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Isolez une matière spécifique pour analyser vos notes détaillées.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="student-subject-filter" className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase font-mono whitespace-nowrap">Matière :</label>
                    <select
                      id="student-subject-filter"
                      value={selectedFilterSubject}
                      onChange={(e) => setSelectedFilterSubject(e.target.value)}
                      className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none transition"
                    >
                      <option value="all">Toutes les matières</option>
                      {subjects.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjectAverages
                    .filter(avgObj => selectedFilterSubject === 'all' || avgObj.subject === selectedFilterSubject)
                    .map(avgObj => {
                      const myGrades = studentGrades.filter(g => g.subject === avgObj.subject);
                    return (
                      <div key={avgObj.subject} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-2xs">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm font-sans">{avgObj.subject}</h3>
                          <span className="font-mono font-bold text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-350 px-2.5 py-1 rounded-lg">
                            Moyenne: {avgObj.average.toFixed(2)}/20
                          </span>
                        </div>

                        <div className="space-y-2">
                          {myGrades.map(grade => {
                            const isNewlyValidated = grade.isValidated && newlyValidatedIds.includes(grade.id);
                            return (
                              <div 
                                key={grade.id} 
                                className={`flex justify-between items-center p-3 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-805 rounded-xl text-xs transition duration-300 ${
                                  isNewlyValidated ? 'animate-grade-highlight border-amber-500/50 dark:border-amber-500/30' : ''
                                }`}
                              >
                                <div className="flex-1 min-w-0 mr-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{grade.title}</span>
                                    {isNewlyValidated && (
                                      <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-300/40 dark:border-amber-700/30">
                                        ★ Nouveau !
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono block">Coef: {grade.coefficient} • {grade.date}</span>
                                </div>
                                
                                <span className={`font-mono font-bold text-sm shrink-0 ${
                                  grade.value >= 14 ? 'text-emerald-600 dark:text-emerald-450' : grade.value >= 10 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500 dark:text-rose-400'
                                }`}>
                                  {grade.value.toFixed(1)}/20
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Premium Active GPA Weighted Simulator & Planner */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-55 flex items-center gap-1.5 font-sans">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>Simulateur GPA Temps Réel</span>
                      </h3>
                      <span className="text-[9px] font-mono leading-none text-zinc-400 dark:text-zinc-500 uppercase">Trimestre 3</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                      Planifiez votre réussite académique ! Saisissez des notes potentielles et observez instantanément leur impact sur votre moyenne générale pondérée.
                    </p>

                    {/* Active Dual GPA comparison gauge */}
                    <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-805 mb-6 text-center">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase font-mono tracking-wider">Actuelle</span>
                        <span className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-100 mt-1 block">
                          {generalAverage > 0 ? generalAverage.toFixed(2) : '--'}/20
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-0.5">Coef total: {totalCoefficients}</span>
                      </div>
                      <div className="border-l border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block uppercase font-mono tracking-wider">Simulée</span>
                        <span className="text-2xl font-black font-mono text-teal-650 dark:text-teal-400 mt-0.5 block">
                          {simulatedAverage > 0 ? simulatedAverage.toFixed(2) : (generalAverage > 0 ? generalAverage.toFixed(2) : '--')}/20
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-0.5">Coef total: {simCoefficients}</span>
                      </div>
                    </div>

                    {/* Delta Display Indicator */}
                    {simulatedGrades.length > 0 && (
                      <div className={`p-3 rounded-lg text-center mb-6 text-xs font-semibold ${
                        gpaDelta >= 0 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/20' 
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450 border border-rose-200/50 dark:border-rose-900/20'
                      }`}>
                        <span>Différence Générale : </span>
                        <strong className="font-mono">
                          {gpaDelta >= 0 ? '+' : ''}{gpaDelta.toFixed(2)} pts
                        </strong>
                        <p className="text-[10px] text-zinc-455 dark:text-zinc-450 mt-1 font-normal select-none leading-relaxed">
                          {gpaDelta >= 0 
                            ? "Cette simulation augmente ou maintient votre standing académique ! Félicitations." 
                            : "Attention, cette note simulée tire votre moyenne pondérée vers le bas."
                          }
                        </p>
                      </div>
                    )}

                    {/* Ingestion form for hypothetical grades */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = parseFloat(simValue);
                        const coeff = parseFloat(simCoeff);
                        if (isNaN(val) || val < 0 || val > 20) {
                          alert("Veuillez saisir une note valide entre 0 et 20.");
                          return;
                        }
                        if (isNaN(coeff) || coeff <= 0) {
                          alert("Veuillez saisir un coefficient valide.");
                          return;
                        }
                        const id = `sim_${Date.now()}`;
                        setSimulatedGrades([...simulatedGrades, {
                          id,
                          subject: simSubject,
                          value: val,
                          coefficient: coeff,
                          title: simTitle.trim() || 'Simulée'
                        }]);
                        setSimTitle('Devoir Blanc Saisi');
                      }}
                      className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">Simuler une évaluation</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-0.5">Note (sur 20)</label>
                          <input 
                            type="number" 
                            step="0.25"
                            min="0"
                            max="20"
                            value={simValue}
                            onChange={(e) => setSimValue(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs font-mono font-bold text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-0.5">Coefficient</label>
                          <input 
                            type="number" 
                            step="0.5"
                            min="0.5"
                            max="10"
                            value={simCoeff}
                            onChange={(e) => setSimCoeff(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs font-mono font-bold text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-0.5">Matière</label>
                        <select 
                          value={simSubject}
                          onChange={(e) => setSimSubject(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 px-2 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs text-zinc-700 dark:text-zinc-200 font-medium"
                        >
                          {subjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-0.5">Description de la note</label>
                        <input 
                          type="text" 
                          value={simTitle}
                          onChange={(e) => setSimTitle(e.target.value)}
                          placeholder="Devoir Blanc Saisi"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-100"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-all"
                      >
                        Ajouter à la simulation
                      </button>
                    </form>
                  </div>

                  {/* Simulated list ledger */}
                  {simulatedGrades.length > 0 && (
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">Notes Simulées actives</span>
                        <button 
                          onClick={() => setSimulatedGrades([])}
                          className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          Tout effacer
                        </button>
                      </div>

                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {simulatedGrades.map(g => (
                          <div key={g.id} className="flex justify-between items-center p-2 bg-teal-500/5 dark:bg-teal-400/5 border border-teal-500/15 rounded-lg text-[11px]">
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate leading-none">{g.title}</span>
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 block">{g.subject} (Coef: {g.coefficient})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 shrink-0">{g.value}/20</span>
                              <button 
                                onClick={() => setSimulatedGrades(simulatedGrades.filter(x => x.id !== g.id))}
                                className="p-1 hover:text-red-500 transition text-zinc-400"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Homework completion checklist */}
          {activeTab === 'homework' && (
            <motion.div
              key="student-homework"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs"
            >
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Cahier de Devoirs Pédagogiques</h2>
              
              <div className="space-y-4">
                {classHomeworks.map(hw => {
                  const isCompleted = hw.completedBy.includes(student.id);
                  return (
                    <div 
                      key={hw.id} 
                      className={`p-5 rounded-xl border transition ${
                        isCompleted ? 'bg-zinc-50/30 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800' : 'bg-white dark:bg-zinc-950 border-teal-100 dark:border-teal-900/30 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                              {hw.subject}
                            </span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">À rendre avant: {hw.dueDate}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-1.5">{hw.title}</h3>
                        </div>

                        <button
                          onClick={() => onToggleHomework(hw.id)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                            isCompleted 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-350 border border-emerald-100 dark:border-emerald-900/30' 
                              : 'bg-[#00A896] hover:bg-teal-600 text-white shadow-3xs'
                          }`}
                          id={`toggle-hw-btn-${hw.id}`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Marquer comme non fait</span>
                            </>
                          ) : (
                            <>
                              <span>Marquer comme rendu</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-sans mt-3 border-t border-zinc-100 dark:border-zinc-850 pt-2.5">
                        {hw.description}
                      </p>
                    </div>
                  );
                })}

                {classHomeworks.length === 0 && (
                  <div className="text-center py-12 text-zinc-400">
                    Aucun devoir répertorié. Bien joué !
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Schedule Calendar panel */}
          {activeTab === 'schedule' && (
            <motion.div
              key="student-schedule"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-6"
            >
              {/* Calendar Header with toggles etc */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Mon Emploi du Temps Hebdomadaire Interactif</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Consultez l'agenda de la classe, planifiez vos révisions et consignez vos notes de révision.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* View switcher */}
                  <div className="bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex">
                    <button
                      onClick={() => setCalendarView('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        calendarView === 'grid' 
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-3xs' 
                          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hebdomadaire</span>
                    </button>
                    <button
                      onClick={() => setCalendarView('daily')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        calendarView === 'daily' 
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-3xs' 
                          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Jour par Jour</span>
                    </button>
                  </div>

                  {/* Subject filter for the schedules */}
                  <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                    <select
                      value={calendarSubjectFilter}
                      onChange={(e) => setCalendarSubjectFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none border-none py-0.5"
                    >
                      <option value="all">Sujets (Tous)</option>
                      {/* List subjects */}
                      {Array.from(new Set(fullSchedule.map(s => s.subject))).map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>

                  {/* Add Revision Slot button */}
                  <button
                    onClick={() => setShowAddEvent(!showAddEvent)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#00A896] hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-555 text-white rounded-xl transition cursor-pointer shadow-3xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Planifier Étude</span>
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
                    <Info className="w-3.5 h-3.5 text-[#00A896]" />
                    <span>Planifier un bloc d'étude autonome ou révision sur mon emploi du temps</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Jour</label>
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
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Module / Objectif</label>
                      <input
                        type="text"
                        value={newEventSubject}
                        onChange={(e) => setNewEventSubject(e.target.value)}
                        placeholder="ex: Révision Chimie Organique"
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
                          placeholder="08:00"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-center text-zinc-700 dark:text-zinc-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Fin</label>
                        <input
                          type="text"
                          value={newEventEndTime}
                          onChange={(e) => setNewEventEndTime(e.target.value)}
                          placeholder="09:30"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-mono font-bold text-center text-zinc-700 dark:text-zinc-200 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Lieu / Salle</label>
                      <input
                        type="text"
                        value={newEventRoom}
                        onChange={(e) => setNewEventRoom(e.target.value)}
                        placeholder="ex: Salle d'étude 3, Bibliothèque"
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider">Code Couleur</label>
                        <select
                          value={newEventColor}
                          onChange={(e) => setNewEventColor(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none"
                        >
                          <option value="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-850">Vert (Soutien)</option>
                          <option value="bg-indigo-55/60 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850">Violet (Révision)</option>
                          <option value="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-250 dark:border-amber-850">Or (Validation)</option>
                          <option value="bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-450 border border-sky-200 dark:border-sky-850">Bleu (Devoir)</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (!newEventSubject.trim()) {
                            alert('Veuillez spécifier un sujet ou objectif pour votre bloc.');
                            return;
                          }
                          const newSched: ScheduleEvent = {
                            id: `custom_sched_${Date.now()}`,
                            classId: student.classId,
                            dayOfWeek: selectedDayOfWeek,
                            subject: newEventSubject,
                            startTime: newEventStartTime,
                            endTime: newEventEndTime,
                            room: newEventRoom,
                            teacherName: newEventTeacherName,
                            // we inject customized helper tags
                            notes: 'CustomRevision'
                          };
                          // store color configurations and data
                          const updated = [...customEvents, newSched];
                          setCustomEvents(updated);
                          localStorage.setItem('educonnect_custom_schedules', JSON.stringify(updated));
                          
                          // Also store color map
                          localStorage.setItem(`color_sched_${newSched.id}`, newEventColor);

                          setNewEventSubject('Séance d\'Étude');
                          setShowAddEvent(false);
                        }}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Enregistrer
                      </button>
                    </div>
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
                      const dayEventsLength = fullSchedule.filter(ev => ev.dayOfWeek === d && (calendarSubjectFilter === 'all' || ev.subject === calendarSubjectFilter)).length;

                      return (
                        <button
                          key={d}
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
                      .filter(ev => ev.dayOfWeek === selectedDayOfWeek && (calendarSubjectFilter === 'all' || ev.subject === calendarSubjectFilter))
                      .sort((a,b) => a.startTime.localeCompare(b.startTime))
                      .map(ev => {
                        const isCustom = ev.notes === 'CustomRevision';
                        const colorMapClass = localStorage.getItem(`color_sched_${ev.id}`) || 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100';
                        const currentSessionLog = eventLogs[ev.id] || '';

                        return (
                          <div 
                            key={ev.id}
                            onClick={() => {
                              setSelectedCalendarEvent(ev);
                              setActiveLogText(eventLogs[ev.id] || '');
                            }}
                            className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-teal-500/50 cursor-pointer ${colorMapClass}`}
                          >
                            <div className="flex gap-4 items-center">
                              <div className="text-center font-mono shrink-0 py-1.5 px-3 bg-zinc-900/5 dark:bg-zinc-100/5 rounded-xl">
                                <span className="text-xs font-bold block">{ev.startTime}</span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">à {ev.endTime}</span>
                              </div>
                              
                              <div>
                                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                                  <span>{ev.subject}</span>
                                  {isCustom && <span className="text-[9px] uppercase font-mono bg-indigo-100 text-indigo-700 px-1.5 rounded">Personnel</span>}
                                </h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Enseignant : <span className="font-semibold text-zinc-600 dark:text-zinc-300">{ev.teacherName}</span> • Salle : <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{ev.room}</span></p>
                                {currentSessionLog && (
                                  <p className="text-[10.5px] italic text-zinc-500 mt-1 lines-clamp-1">📝 Log : {currentSessionLog}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* If Custom Revision, give trash button */}
                              {isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const cleaned = customEvents.filter(x => x.id !== ev.id);
                                    setCustomEvents(cleaned);
                                    localStorage.setItem('educonnect_custom_schedules', JSON.stringify(cleaned));
                                    localStorage.removeItem(`color_sched_${ev.id}`);
                                    if (selectedCalendarEvent?.id === ev.id) setSelectedCalendarEvent(null);
                                  }}
                                  className="p-1 hover:text-red-500 text-zinc-400 transition cursor-pointer"
                                  title="Supprimer la planification"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline">Détails & Notes →</span>
                            </div>
                          </div>
                        );
                      })}

                    {fullSchedule.filter(ev => ev.dayOfWeek === selectedDayOfWeek && (calendarSubjectFilter === 'all' || ev.subject === calendarSubjectFilter)).length === 0 && (
                      <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 italic text-xs">
                        Aucun cours planifié pour ce jour. Cliquez sur "Planifier Étude" pour y ajouter vos propres révisions !
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
                      .filter(ev => ev.dayOfWeek === day && (calendarSubjectFilter === 'all' || ev.subject === calendarSubjectFilter))
                      .sort((a,b) => a.startTime.localeCompare(b.startTime));

                    return (
                      <div key={day} className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-805 rounded-xl space-y-3">
                        <h3 className="text-xs font-bold text-center border-b border-zinc-200 dark:border-zinc-800 pb-2 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                          {dayName}
                        </h3>
                        
                        <div className="space-y-2.5">
                          {events.map(ev => {
                            const isCustom = ev.notes === 'CustomRevision';
                            const customBgClass = localStorage.getItem(`color_sched_${ev.id}`) || 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-3xs';
                            const logging = eventLogs[ev.id];

                            return (
                              <div 
                                key={ev.id} 
                                onClick={() => {
                                  setSelectedCalendarEvent(ev);
                                  setActiveLogText(eventLogs[ev.id] || '');
                                }}
                                className={`p-3 border rounded-xl hover:border-teal-500/40 transition cursor-pointer select-none relative group ${customBgClass}`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="text-xs font-bold line-clamp-1">{ev.subject}</h4>
                                  {isCustom && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const cleaned = customEvents.filter(x => x.id !== ev.id);
                                        setCustomEvents(cleaned);
                                        localStorage.setItem('educonnect_custom_schedules', JSON.stringify(cleaned));
                                        localStorage.removeItem(`color_sched_${ev.id}`);
                                        if (selectedCalendarEvent?.id === ev.id) setSelectedCalendarEvent(null);
                                      }}
                                      className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-150 p-0.5"
                                      title="Supprimer"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                                <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{ev.startTime} - {ev.endTime}</p>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block truncate mt-1">Salle : {ev.room}</span>
                                <span className="text-[9.5px] text-teal-600 dark:text-teal-400 font-bold truncate block">{ev.teacherName}</span>
                                
                                {logging && (
                                  <span className="inline-block mt-1 text-[8.5px] px-1 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-sm italic truncate block">
                                    ✓ Notes rédigées
                                  </span>
                                )}
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

              {/* Interactive Event Detail Overlay / Modal */}
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
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1">{selectedCalendarEvent.subject}</h3>
                        </div>
                        <button
                          onClick={() => setSelectedCalendarEvent(null)}
                          className="text-zinc-400 hover:text-zinc-650 cursor-pointer text-xs font-bold"
                        >
                          Fermer
                        </button>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-1 text-xs">
                        <p><span className="text-zinc-400">Enseignant :</span> <strong className="text-zinc-700 dark:text-zinc-200">{selectedCalendarEvent.teacherName}</strong></p>
                        <p><span className="text-zinc-400">Salle académique :</span> <strong className="text-zinc-700 dark:text-zinc-200">{selectedCalendarEvent.room}</strong></p>
                      </div>

                      {/* Attached homework finder */}
                      {classHomeworks.filter(h => h.subject.toLowerCase() === selectedCalendarEvent.subject.toLowerCase()).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-[#00A896] uppercase font-mono tracking-wider">Devoirs liés à ce cours</h4>
                          {classHomeworks
                            .filter(h => h.subject.toLowerCase() === selectedCalendarEvent.subject.toLowerCase())
                            .map(h => {
                              const checked = h.completedBy.includes(student.id);
                              return (
                                <div key={h.id} className="p-2.5 bg-[#00A896]/5 border border-teal-500/15 rounded-lg flex justify-between items-center text-xs">
                                  <span className="truncate pr-2 font-medium">{h.title}</span>
                                  <span className={`text-[9px] font-bold uppercase ${checked ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {checked ? '✓ Rendu' : 'À Faire'}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {/* Interactive Self Revision Study Log Journal */}
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-wider">
                          Notes & Rapports personnels de révision
                        </h4>
                        <textarea
                          rows={3}
                          value={activeLogText}
                          onChange={(e) => setActiveLogText(e.target.value)}
                          placeholder="Consignez vos objectifs, chapitres relus ou devoirs à intégrer pour la séance..."
                          className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                        />
                        <button
                          onClick={() => {
                            const newEventLogs = {
                              ...eventLogs,
                              [selectedCalendarEvent.id]: activeLogText
                            };
                            setEventLogs(newEventLogs);
                            localStorage.setItem('educonnect_student_event_logs', JSON.stringify(newEventLogs));
                            alert('Vos notes d\'auto-révision ont été archivées avec succès !');
                            setSelectedCalendarEvent(null);
                          }}
                          className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white font-bold text-xs rounded-xl"
                        >
                          Sauvegarder mes Notes d'Étude
                        </button>
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
