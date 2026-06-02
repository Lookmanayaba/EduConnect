import React, { useState } from 'react';
import { 
  Student, 
  Grade, 
  Absence, 
  Homework, 
  Announcement, 
  SchoolMessage, 
  SchoolPayment, 
  ScheduleEvent,
  AIAnalysisResult,
  Teacher
} from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Calendar, 
  Wallet, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Send,
  Download,
  Clock3,
  Search,
  CheckSquare,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FileInput from './FileInput';

interface DashboardParentProps {
  parentName: string;
  students: Student[];
  grades: Grade[];
  absences: Absence[];
  homeworks: Homework[];
  announcements: Announcement[];
  payments: SchoolPayment[];
  messages: SchoolMessage[];
  teachers: Teacher[];
  schedules: ScheduleEvent[];
  aiAnalyses: AIAnalysisResult[];
  onAddMessage: (content: string, receiverId: string) => void;
  onJustifyAbsence: (absenceId: string, justificationText: string) => void;
  onPayPayment: (paymentId: string) => void;
  onTriggerAI: (studentId: string, studentName: string, classLevel: string, studentGrades: Grade[], behavior: string) => Promise<void>;
  aiLoading: boolean;
  userPhoto?: string;
  onUpdatePhoto?: (base64: string) => void;
}

export default function DashboardParent({
  parentName,
  students,
  grades,
  absences,
  homeworks,
  announcements,
  payments,
  messages,
  teachers,
  schedules,
  aiAnalyses,
  onAddMessage,
  onJustifyAbsence,
  onPayPayment,
  onTriggerAI,
  aiLoading,
  userPhoto,
  onUpdatePhoto
}: DashboardParentProps) {
  // Profile photo state
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

  // Find all children for this parent
  const myChildren = students.filter(s => s.parentName.toLowerCase() === parentName.toLowerCase());
  
  // Active child index
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const activeChild = myChildren[activeChildIndex] || myChildren[0] || students[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'bulletin' | 'notes' | 'attendance' | 'homework' | 'payments' | 'messages'>('overview');
  
  React.useEffect(() => {
    const element = document.getElementById('parent-tab-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);
  
  // Justification states
  const [justifyingId, setJustifyingId] = useState<string | null>(null);
  const [justificationText, setJustificationText] = useState('');

  // Messagerie states
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [messageText, setMessageText] = useState('');

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <p className="text-lg">Aucun élève associé à ce profil parent.</p>
      </div>
    );
  }

  // Filter child data
  const childGrades = grades.filter(g => g.studentId === activeChild.id);
  const childAbsences = absences.filter(a => a.studentId === activeChild.id);
  const childHomeworks = homeworks.filter(h => h.classId === activeChild.classId);
  const childPayments = payments.filter(p => p.studentId === activeChild.id);
  const childSchedule = schedules.filter(s => s.classId === activeChild.classId);
  const childAIAnalysis = aiAnalyses.find(a => a.studentId === activeChild.id);

  // Chat/Messages with teachers
  const chatMessages = messages.filter(m => 
    (m.senderName === parentName && m.receiverId === selectedTeacherId) ||
    (m.receiverName === parentName && m.senderId === selectedTeacherId)
  ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Statistics calculation
  const averageGrade = childGrades.length > 0 
    ? childGrades.reduce((acc, g) => acc + g.value, 0) / childGrades.length 
    : 0;

  const totalAbsences = childAbsences.filter(a => a.type === 'absence').length;
  const totalDelays = childAbsences.filter(a => a.type === 'delay').length;
  const unexcusedAbsences = childAbsences.filter(a => !a.justified).length;

  const handleJustifySubmit = (absenceId: string) => {
    if (!justificationText.trim()) return;
    onJustifyAbsence(absenceId, justificationText);
    setJustifyingId(null);
    setJustificationText('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onAddMessage(messageText, selectedTeacherId);
    setMessageText('');
  };

  // Group grades by subject to display averages
  const subjects = Array.from(new Set(childGrades.map(g => g.subject)));
  const gradesBySubject = subjects.map(subj => {
    const subjGrades = childGrades.filter(g => g.subject === subj);
    const avg = subjGrades.reduce((acc, g) => acc + g.value, 0) / subjGrades.length;
    return { subject: subj, grades: subjGrades, average: avg };
  });

  return (
    <div className="space-y-6 pb-28" id="dashboard-parent-container">
      {/* Header section matching the fluid clean spacing of the PDF / Mockup layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-4">
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt="Profil" 
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm shrink-0" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-200 dark:border-teal-800 shrink-0">
              {parentName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">Espace Famille</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Bonjour, {parentName}</h1>
              <button
                onClick={() => setShowPhotoEditor(!showPhotoEditor)}
                className="inline-flex self-start sm:self-auto items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-teal-600 dark:text-teal-400 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-all cursor-pointer"
                id="parent-add-photo-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{userPhoto ? 'Changer ma photo' : 'Ajouter ma photo'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Suivi en temps réel de votre enfant • {activeChild.name}</p>
          </div>
        </div>

        {/* Children dropdown selector if multiple children */}
        {myChildren.length > 1 && (
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {myChildren.map((child, idx) => (
              <button
                key={child.id}
                onClick={() => {
                  setActiveChildIndex(idx);
                  setActiveTab('overview');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeChildIndex === idx 
                    ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-300 shadow-sm' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                id={`child-btn-${child.id}`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
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
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
          <FileInput 
            onImageSelected={(b64) => {
              if (onUpdatePhoto) onUpdatePhoto(b64);
            }} 
            currentImage={userPhoto} 
            id="parent-profile-photo-input"
          />
        </motion.div>
      )}


      {/* Child Information Summary Banner in the beautiful mockup round-style */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </span>
              <span className="bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {activeChild.classId === 'c1' ? '6ème A' : activeChild.classId === 'c2' ? '5ème B' : activeChild.classId === 'c3' ? '3ème Alpha' : 'Terminale S1'}
              </span>
            </div>
            <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{activeChild.name}</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono">ID: {activeChild.registrationNumber}</p>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 mt-4 pt-4 flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
            <span>Né(e) le {activeChild.birthDate}</span>
            <span className="font-medium text-teal-600 dark:text-teal-400">3ème Trimestre</span>
          </div>
        </div>

        {/* Circular statistic display inspired strictly by reference mockup loan-budget rings */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center mb-2">
            {/* Background circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#f4f4f5" strokeWidth="8" fill="transparent" className="dark:stroke-zinc-800" />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                stroke="#0d9488" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - averageGrade / 20)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center">
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-105">{averageGrade > 0 ? averageGrade.toFixed(2) : '--'}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 block">/20</span>
            </div>
          </div>
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Moyenne Générale</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-sans">Calculée sur {childGrades.length} notes reçues</p>
        </div>

        {/* Attendance counter block */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Présence & Assiduité</h4>
            <Clock className="w-5 h-5 text-red-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="bg-red-50/50 dark:bg-red-950/15 p-2.5 rounded-xl text-center">
              <span className="text-xl font-bold text-red-600 dark:text-red-400 block">{totalAbsences}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Absences</span>
            </div>
            <div className="bg-amber-50/50 dark:bg-amber-950/15 p-2.5 rounded-xl text-center">
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block">{totalDelays}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Retards</span>
            </div>
          </div>
          {unexcusedAbsences > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{unexcusedAbsences} événement(s) à justifier !</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-450 font-medium font-sans">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Situation entièrement justifiée</span>
            </div>
          ) }
        </div>

        {/* Payments counter block */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Frais de Scolarité</h4>
            <Wallet className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-105 my-1">
              {childPayments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0).toFixed(2)} €
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Solde débiteur restant</p>
          </div>
          <button 
            onClick={() => setActiveTab('payments')}
            className="w-full text-center text-xs text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-300 transition"
          >
            Consulter les factures &rarr;
          </button>
        </div>
      </div>

      {/* Floating Bottom App Navigation Bar (inspired strictly by mockups) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-zinc-950/95 backdrop-blur-md rounded-full py-2.5 px-3 shadow-2xl border border-zinc-800 flex items-center justify-between gap-1">
        {[
          { id: 'overview', label: 'Accueil', icon: FileText },
          { id: 'bulletin', label: 'Bulletin', icon: GraduationCap },
          { id: 'notes', label: 'Notes', icon: BookOpen },
          { id: 'attendance', label: 'Présences', icon: Clock },
          { id: 'homework', label: 'Devoirs', icon: CheckSquare },
          { id: 'payments', label: 'Paiements', icon: Wallet },
          { id: 'messages', label: 'Messages', icon: MessageSquare }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="relative flex-1 py-2 px-1 md:py-2.5 md:px-3 text-center flex items-center justify-center rounded-full transition-all cursor-pointer select-none border-none outline-none"
              id={`tab-btn-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabParent"
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
                <span className={`text-[10px] md:text-xs font-bold tracking-tight leading-none whitespace-nowrap ${isActive ? 'inline-block' : 'hidden md:inline-block'}`}>
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Tab switching body with responsive animations */}
      <div className="min-h-[400px] scroll-mt-24" id="parent-tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview-panels"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left column: Homework and Schedules */}
              <div className="lg:col-span-2 space-y-6">
                {/* Devoirs du jour */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Cahier de Devoirs à Faire</h2>
                    <button 
                      onClick={() => setActiveTab('homework')} 
                      className="text-xs text-teal-600 dark:text-teal-450 font-medium hover:underline"
                    >
                      Tout voir ({childHomeworks.length})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {childHomeworks.slice(0, 3).map(hw => {
                      const isCompleted = hw.completedBy.includes(activeChild.id);
                      return (
                        <div 
                          key={hw.id} 
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40 border border-zinc-100 dark:border-zinc-800 transition"
                        >
                          <div className={`mt-0.5 p-2 rounded-lg ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'}`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 font-mono uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                {hw.subject}
                              </span>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">Pour le {hw.dueDate}</span>
                            </div>
                            <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-100 mt-1 truncate">{hw.title}</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{hw.description}</p>
                          </div>
                          <div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isCompleted 
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-350 font-semibold' 
                                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-350 font-semibold'
                            }`}>
                              {isCompleted ? 'Rendu' : 'À faire'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {childHomeworks.length === 0 && (
                      <div className="text-center py-8 text-zinc-400 text-sm">
                        Aucun devoir assigné pour le moment. Excellent travail !
                      </div>
                    )}
                  </div>
                </div>

                {/* Emploi du temps du jour */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Aperçu de l'Emploi de Temps Hebdomadaire</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                    {[1, 2, 3, 4, 5].map(dayNum => {
                      const dayName = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][dayNum - 1];
                      const dayEvents = childSchedule.filter(ev => ev.dayOfWeek === dayNum).sort((a,b) => a.startTime.localeCompare(b.startTime));
                      return (
                        <div key={dayNum} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-950/40">
                          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">{dayName}</h4>
                          <div className="space-y-2">
                            {dayEvents.map(event => (
                              <div key={event.id} className="p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 text-left text-[10px] leading-tight bg-white dark:bg-zinc-900 shadow-2xs">
                                <strong className="font-semibold text-zinc-950 dark:text-zinc-150 block truncate">{event.subject}</strong>
                                <span className="text-zinc-500 dark:text-zinc-400 text-[10px] block font-mono">{event.startTime} - {event.endTime}</span>
                                <span className="text-zinc-450 dark:text-zinc-500 block text-[9px] truncate">{event.room}</span>
                              </div>
                            ))}
                            {dayEvents.length === 0 && (
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center block py-4">Pas de cours</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right column: Announcements and Bulletin link */}
              <div className="space-y-6">
                {/* School Announcements */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Annonces Générales</h2>
                  <div className="space-y-4">
                    {announcements.slice(0, 3).map(ann => (
                      <div key={ann.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/30 rounded-xl relative hover:bg-zinc-50/70 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition">
                        <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 block mb-1">{ann.date} • {ann.author}</span>
                        <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 mb-1 leading-snug">{ann.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instant Messenger Callout */}
                <div className="bg-radial from-teal-600 to-teal-800 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
                    <MessageSquare className="w-36 h-36 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Échange Direct</h3>
                  <p className="text-xs text-teal-100 mt-1 mb-4 leading-relaxed">
                    Un doute sur un devoir ? Envoyez un message immédiat aux enseignants de votre enfant.
                  </p>
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="bg-white text-teal-700 text-xs font-bold px-4 py-2 rounded-xl block text-center hover:bg-teal-50 transition"
                  >
                    Ouvrir la boîte de dialogue &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bulletin tab: Visual printable bulletin with premium AI observation report card */}
          {activeTab === 'bulletin' && (
            <motion.div 
              key="bulletin-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                {/* Visual Header of simulated official bulletin */}
                <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#00A896] dark:text-teal-400">EduConnect • BULLETIN SCOLAIRE</h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Année Scolaire d'Étude Royale : 2025-2026</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Période: Premier & Second Trimestre d'évaluation • <strong>3ème Trimestre (Actif)</strong></p>
                  </div>
                  <div className="text-left md:text-right text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                    <p><strong>Élève:</strong> {activeChild.name}</p>
                    <p><strong>Classe:</strong> {activeChild.classId === 'c1' ? '6ème A (Collège)' : activeChild.classId === 'c2' ? '5ème B (Collège)' : activeChild.classId === 'c3' ? '3ème Alpha' : 'Terminale S1 (Lycée)'}</p>
                    <p><strong>Inscrit le:</strong> {activeChild.birthDate}</p>
                  </div>
                </div>

                {/* Main Table for subjects in the bulletin */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                        <th className="py-3 px-4 font-bold">Matière</th>
                        <th className="py-3 px-4 font-bold">Professeur</th>
                        <th className="py-3 px-4 font-bold text-center">Coefficient</th>
                        <th className="py-3 px-4 font-bold text-center">Moyenne de l'Élève</th>
                        <th className="py-3 px-4 font-bold text-center">Nombre d'Éval</th>
                        <th className="py-3 px-4 font-bold">Appréciation Générale du Corps Enseignant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                      {gradesBySubject.map(subjGroup => {
                        // find primary teacher
                        const teacherName = teachers.find(t => t.subjects.includes(subjGroup.subject))?.name || "Corps Enseignant";
                        const coeff = subjGroup.grades[0]?.coefficient || 1;
                        let observation = "";
                        if (subjGroup.average < 10) {
                          observation = "Résultats fragiles. Doit intensifier ses efforts de rigueur et sa concentration.";
                        } else if (subjGroup.average < 13) {
                          observation = "Travail régulier. Bon potentiel de progrès, continuez ainsi !";
                        } else if (subjGroup.average < 16) {
                          observation = "Très bonne implication ! Résultats solides, poursuivez vos efforts.";
                        } else {
                          observation = "Excellent trimestre. Participation vive, sens de l'analyse hors pair !";
                        }

                        return (
                          <tr key={subjGroup.subject} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{subjGroup.subject}</td>
                            <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 text-xs">{teacherName}</td>
                            <td className="py-3.5 px-4 text-center font-mono text-zinc-900 dark:text-zinc-100">{coeff}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-700 dark:text-teal-400">{subjGroup.average.toFixed(1)}/20</td>
                            <td className="py-3.5 px-4 text-center font-mono text-zinc-400 dark:text-zinc-500">{subjGroup.grades.length}</td>
                            <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-350 text-xs italic">{observation}</td>
                          </tr>
                        );
                      })}
                      {gradesBySubject.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-zinc-400 dark:text-zinc-505 bg-white dark:bg-zinc-900 italic">Aucune note n'a été saisie pour l'instant.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Overall summary footer block */}
                <div className="bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-550 mb-2">Décision du Conseil de Classe</h4>
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-350 text-xs font-semibold rounded border border-emerald-200 dark:border-emerald-900/30">
                        Avis Favorable d'Étape
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-405">Moyenne Générale Estimée : <strong className="text-zinc-855 dark:text-zinc-100">{averageGrade.toFixed(2)}/20</strong></span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-zinc-400 dark:text-zinc-550 font-mono">Visa du Principal Moreau</p>
                    <div className="mt-2 text-xs italic text-zinc-500 dark:text-zinc-400 font-serif">Bulletins électroniques certifiés EduConnect</div>
                  </div>
                </div>

                {/* PREMIUM AI MODULE PORTAL */}
                <div className="mt-8 border-t-2 border-dashed border-teal-200 pt-8" id="bulletin-ai-portal">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border border-teal-100 dark:border-teal-900/30 shadow-2xs relative">
                    <div className="absolute top-4 right-4 bg-teal-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Module IA Premium</span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-xs text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-base font-bold text-teal-900 dark:text-teal-300">Analyse Pédagogique par Intelligence Artificielle</h3>
                        <p className="text-xs text-teal-700 dark:text-teal-400 leading-relaxed max-w-2xl">
                          Profitez du diagnostic intelligent de <strong>Gemini AI</strong> pour analyser les performances scolaires en temps réel, détecter de façon précoce les matières en fragilité et obtenir des suggestions d'exercices immédiates.
                        </p>
                      </div>
                    </div>

                    {/* AI trigger Button or Results display */}
                    <div className="mt-6">
                      {!childAIAnalysis ? (
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-teal-100 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Aucun audit IA n'a été généré pour ce trimestre. Lancez l'analyse dès maintenant.
                          </p>
                          <button
                            onClick={() => onTriggerAI(activeChild.id, activeChild.name, activeChild.classId, childGrades, "Très sérieux, discret en classe")}
                            disabled={aiLoading}
                            className={`px-4 py-2 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                              aiLoading ? 'opacity-65 cursor-wait' : ''
                            }`}
                            id="analyse-ai-trigger-btn"
                          >
                            {aiLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Analyse en cours...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Lancer le diagnostic IA</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-teal-100 dark:border-teal-900/40 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden text-zinc-800 dark:text-zinc-100">
                          {/* Diagnostic summary */}
                          <div className="p-5 bg-teal-500/5 dark:bg-teal-950/20">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal-700 dark:text-teal-400">Diagnostic Global de l'Élève</span>
                            <p className="text-sm text-teal-900 dark:text-teal-300 mt-1 font-medium leading-relaxed">
                              {childAIAnalysis.summary}
                            </p>
                            
                            {childAIAnalysis.difficultyDetected ? (
                              <div className="mt-3 inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs font-bold px-3 py-1.5 rounded-lg font-sans">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Détection Précoce : Profil d'Alerte Scolaire Activé</span>
                              </div>
                            ) : (
                              <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold px-3 py-1.5 rounded-lg font-sans">
                                <CheckCircle className="w-4 h-4" />
                                <span>Performances Globalement Précises et Satisfaisantes</span>
                              </div>
                            )}
                          </div>

                          {/* Specific warnings */}
                          <div className="p-5">
                            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-550 mb-3 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span>Points de Vigilance détectés</span>
                            </h4>
                            <ul className="space-y-2">
                              {childAIAnalysis.warnings.map((warn, i) => (
                                <li key={i} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2 leading-relaxed">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                  <span>{warn}</span>
                                </li>
                              ))}
                              {childAIAnalysis.warnings.length === 0 && (
                                <li className="text-xs text-zinc-400 dark:text-zinc-500 italic">Aucun point de vigilance identifié. L'élève progresse sereinement.</li>
                              )}
                            </ul>
                          </div>

                          {/* Personalized tips */}
                          <div className="p-5">
                            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-550 mb-3 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-teal-500" />
                              <span>Suggestions & Remédiations Pédagogiques de l'IA</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {childAIAnalysis.suggestions.map((sug, i) => (
                                <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 block mb-1">Ressource #{i+1}</span>
                                  <p className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed">{sug}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bulletin automatic comments */}
                          <div className="p-5 bg-teal-50/50 dark:bg-teal-950/10">
                            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-550 mb-2">Commentaire Recommandé pour le Bulletin Officiel</h4>
                            <div className="p-3 bg-white dark:bg-zinc-900 border border-teal-100 dark:border-teal-900/30 rounded-lg italic text-zinc-700 dark:text-zinc-300 text-xs font-serif leading-relaxed">
                              "{childAIAnalysis.teacherComment}"
                            </div>
                          </div>

                          {/* Re-analyze option */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/45 text-right">
                            <button
                              onClick={() => onTriggerAI(activeChild.id, activeChild.name, activeChild.classId, childGrades, "Sérieux mais mériterait un investissement accru")}
                              disabled={aiLoading}
                              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-350 hover:underline"
                            >
                              Ré-analyser les notes mises à jour &rarr;
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Notes list Tab */}
          {activeTab === 'notes' && (
            <motion.div 
              key="notes-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gradesBySubject.map((subjGroup) => (
                  <div key={subjGroup.subject} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xs">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">{subjGroup.subject}</h3>
                      <span className="font-mono font-bold text-sm bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-350 px-2 py-1 rounded">
                        Moy: {subjGroup.average.toFixed(1)}/20
                      </span>
                    </div>

                    <div className="space-y-2">
                      {subjGroup.grades.map(grade => (
                        <div key={grade.id} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800">
                          <div className="truncate pr-2">
                            <span className="font-medium text-zinc-800 dark:text-zinc-150 block truncate">{grade.title}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">{grade.date} • Coeff: {grade.coefficient}</span>
                          </div>
                          <span className={`font-mono font-bold text-sm ${
                            grade.value >= 14 ? 'text-teal-600 dark:text-teal-400' : grade.value >= 10 ? 'text-zinc-700 dark:text-zinc-300' : 'text-red-500 dark:text-red-400'
                          }`}>
                            {grade.value.toFixed(1)}/20
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {gradesBySubject.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
                    Aucune note disponible à l'affichage pour cet enfant.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Attendance list Tab */}
          {activeTab === 'attendance' && (
            <motion.div 
              key="attendance-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs"
            >
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Relevé des Absences & Retards</h2>
              
              <div className="space-y-4">
                {childAbsences.map(abs => (
                  <div 
                    key={abs.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40 transition gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg ${abs.type === 'absence' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">{abs.type === 'absence' ? 'Absence' : 'Retard'}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-bold">du {abs.date}</span>
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-sans">Durée: {abs.duration || "Non renseigné"} • Trimestre {abs.quarter}</p>
                        {abs.reason && <p className="text-xs text-zinc-650 dark:text-zinc-350 mt-1"><strong>Motif déclaré:</strong> {abs.reason}</p>}
                        {abs.justified && abs.justificationText && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded inline-block mt-2 font-medium font-sans">
                            Justifié : {abs.justificationText}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      {abs.justified ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs font-sans bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <CheckCircle className="w-4 h-4" />
                          <span>Régularisé</span>
                        </div>
                      ) : (
                        <div className="flex flex-col md:items-end gap-2">
                          <span className="text-red-500 font-semibold text-xs flex items-center gap-1 font-sans bg-rose-50 px-2 py-1 rounded">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Non Justifié !</span>
                          </span>
                          
                          {justifyingId === abs.id ? (
                            <div className="mt-2 text-left" id={`justification-form-${abs.id}`}>
                              <textarea
                                placeholder="Rédiger votre motif de justification..."
                                value={justificationText}
                                onChange={(e) => setJustificationText(e.target.value)}
                                className="w-full max-w-xs md:w-64 p-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-teal-500"
                                rows={2}
                              />
                              <div className="flex justify-end gap-1.5 mt-1">
                                <button 
                                  onClick={() => setJustifyingId(null)}
                                  className="px-2 py-1 text-[10px] text-zinc-400 font-medium hover:text-zinc-600"
                                >
                                  Annuler
                                </button>
                                <button 
                                  onClick={() => handleJustifySubmit(abs.id)}
                                  className="px-3 py-1 text-[10px] bg-[#00A896] text-white font-semibold rounded-lg hover:bg-teal-600"
                                  id={`submit-justify-btn-${abs.id}`}
                                >
                                  Soumettre
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setJustifyingId(abs.id)}
                              className="text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                              id={`justify-trigger-btn-${abs.id}`}
                            >
                              Saisir un justificatif en ligne &rarr;
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {childAbsences.length === 0 && (
                  <div className="text-center py-12 text-zinc-400">
                    Aucune absence ou retard signalé ce trimestre. Bravo !
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Homework detail view */}
          {activeTab === 'homework' && (
            <motion.div 
              key="homeworks-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs"
            >
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Devoirs, Cahier de texte & Fichiers Exercices</h2>
              
              <div className="space-y-4">
                {childHomeworks.map(hw => {
                  const isCompleted = hw.completedBy.includes(activeChild.id);
                  return (
                    <div 
                      key={hw.id} 
                      className={`p-5 rounded-xl border transition ${
                        isCompleted ? 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-955/20' : 'border-teal-100 dark:border-teal-900/40 bg-teal-50/5 dark:bg-teal-950/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold tracking-wider text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                              {hw.subject}
                            </span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-505 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Pour le {hw.dueDate}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-1.5">{hw.title}</h3>
                        </div>

                        <div>
                          <span className={`text-[11px] font-bold font-sans px-3 py-1 rounded-full ${
                            isCompleted 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-350 border border-emerald-100 dark:border-emerald-900/30' 
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-350 border border-amber-100 dark:border-amber-900/30'
                          }`}>
                            {isCompleted ? 'Vu & Rendu par l\'élève' : 'En attente de réalisation'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-350 font-sans mt-3 leading-relaxed border-t border-zinc-100/70 dark:border-zinc-800/70 pt-3">
                        {hw.description}
                      </p>

                      {hw.fileName && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-850 transition cursor-pointer">
                          <FileText className="w-4 h-4 text-teal-600 animate-pulse" />
                          <span className="font-mono text-zinc-600 dark:text-zinc-400">{hw.fileName}</span>
                          <button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-650">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {childHomeworks.length === 0 && (
                  <div className="text-center py-12 text-zinc-400">
                    Aucun devoir assigné pour cette classe.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Payments detail View */}
          {activeTab === 'payments' && (
            <motion.div 
              key="payments-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Payment Summary banner */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xs">
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Statut des Facturations Scolaires</h2>
                
                <div className="space-y-3">
                  {childPayments.map(pay => (
                    <div 
                      key={pay.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40 transition gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          pay.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : pay.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-800">{pay.title}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                            Échéance: {pay.dueDate} {pay.paidDate && `• Réglé le ${pay.paidDate}`}
                          </span>
                          {pay.receiptNo && (
                            <span className="text-[9px] font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 mt-1 inline-block">
                              Reçu: {pay.receiptNo}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-zinc-900 text-sm">
                          {pay.amount.toFixed(2)} €
                        </span>
                        
                        {pay.status === 'paid' ? (
                          <div className="flex items-center gap-1.5 text-xs font-sans text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span>Réglé</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold font-sans uppercase px-2 py-0.5 rounded ${
                              pay.status === 'overdue' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {pay.status === 'overdue' ? 'En Retard' : 'À régler'}
                            </span>
                            <button
                              onClick={() => {
                                onPayPayment(pay.id);
                              }}
                              className="px-3 py-1.5 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                              id={`pay-btn-${pay.id}`}
                            >
                              Payer en ligne
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {childPayments.length === 0 && (
                    <div className="text-center py-12 text-zinc-400">
                      Aucune facturation n'est enregistrée pour cette année de scolarité.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Internal messagerie tab */}
          {activeTab === 'messages' && (
            <motion.div 
              key="messages-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[480px] text-zinc-800 dark:text-zinc-100"
            >
              {/* Teacher directory on the left */}
              <div className="border-r border-zinc-105 dark:border-zinc-800 pr-0 md:pr-6 space-y-4">
                <h3 className="text-xs font-bold uppercase font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">Professeurs Certifiés</h3>
                
                <div className="space-y-1.5">
                  {teachers.map(teacher => {
                    const isSelected = selectedTeacherId === teacher.id;
                    return (
                      <button
                        key={teacher.id}
                        onClick={() => setSelectedTeacherId(teacher.id)}
                        className={`w-full text-left p-3 rounded-xl transition ${
                          isSelected ? 'bg-teal-500/10 text-teal-850 dark:text-teal-350 border-l-4 border-[#00A896]' : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/50 border-l-4 border-transparent'
                        }`}
                        id={`teacher-select-btn-${teacher.id}`}
                      >
                        <h4 className="text-xs font-semibold">{teacher.name}</h4>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">{teacher.subjects.join(', ')}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat panel on the right */}
              <div className="md:col-span-2 flex flex-col justify-between max-h-[500px]">
                {/* Active chat title */}
                <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-105">
                      {teachers.find(t => t.id === selectedTeacherId)?.name || 'Professeur'}
                    </h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Messagerie interne sécurisée EduConnect</p>
                  </div>
                </div>

                {/* Messages body */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1.5 scrollbar-thin">
                  {chatMessages.map(msg => {
                    const fromMe = msg.senderName === parentName;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[80%] ${fromMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs ${
                          fromMe ? 'bg-[#00A896] text-white rounded-br-none' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-550 mt-1 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  {chatMessages.length === 0 && (
                    <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-xs italic">
                      Aucun message échangé pour l'instant. Initiez la discussion ci-dessous.
                    </div>
                  )}
                </div>

                {/* Input text message */}
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3" id="message-send-form">
                  <input
                    type="text"
                    placeholder="Écrivez votre message à destination de l'équipe d'enseignement..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-250 rounded-xl outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-teal-505 transition"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-[#00A896] hover:bg-teal-600 text-white rounded-xl transition"
                    id="message-send-submit-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
