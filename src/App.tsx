import React, { useState, useEffect } from 'react';
import { 
  Student, 
  Teacher, 
  ClassRoom, 
  Grade, 
  Absence, 
  Homework, 
  Announcement, 
  SchoolMessage, 
  SchoolPayment, 
  ScheduleEvent,
  AIAnalysisResult,
  SchoolNotification
} from './types';
import { 
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_GRADES,
  INITIAL_ABSENCES,
  INITIAL_HOMEWORK,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_PAYMENTS,
  INITIAL_SCHEDULES,
  INITIAL_MESSAGES,
  getSavedState,
  saveState,
  resetAppStateToDefault
} from './data';
import RoleSelect from './components/RoleSelect';
import DashboardParent from './components/DashboardParent';
import DashboardStudent from './components/DashboardStudent';
import DashboardTeacher from './components/DashboardTeacher';
import DashboardAdmin from './components/DashboardAdmin';
import UserProfileModal from './components/UserProfileModal';
import { 
  GraduationCap, 
  LogOut, 
  RotateCcw, 
  Sparkles,
  Info,
  Bell,
  Sun,
  Moon,
  Check,
  CheckSquare,
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const DEFAULT_NOTIFICATIONS: SchoolNotification[] = [
  {
    id: 'notif_1',
    title: 'Nouveau Devoir en Mathématiques 📝',
    content: 'M. Jean Robert a publié un devoir à rendre pour vendredi prochain.',
    type: 'homework',
    date: new Date().toISOString().split('T')[0],
    isRead: false,
    targetRole: 'student'
  },
  {
    id: 'notif_2',
    title: 'Annonce Générale de la Direction 📢',
    content: 'La réunion trimestrielle parents-professeurs aura lieu jeudi prochain à 18h.',
    type: 'announcement',
    date: new Date().toISOString().split('T')[0],
    isRead: false,
    targetRole: 'parent'
  },
  {
    id: 'notif_3',
    title: 'Nouveau Devoir de Français Saisi 📚',
    content: 'Un nouveau devoir "Dictée & Grammaire" a été enregistré. En attente de validation par la direction.',
    type: 'grade',
    date: new Date().toISOString().split('T')[0],
    isRead: false,
    targetRole: 'teacher'
  },
  {
    id: 'notif_4',
    title: 'Alerte Absence Importante ⚠️',
    content: 'Un élève de la classe 6ème A a été signalé absent sans justificatif préalable.',
    type: 'announcement',
    date: new Date().toISOString().split('T')[0],
    isRead: true,
    targetRole: 'admin'
  }
];

export default function App() {
  // 1. Central database states hydrated from local caches or seed datas
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payments, setPayments] = useState<SchoolPayment[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [messages, setMessages] = useState<SchoolMessage[]>([]);
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysisResult[]>([]);

  // Custom persistent states
  const [notifications, setNotifications] = useState<SchoolNotification[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [profilePhotos, setProfilePhotos] = useState<Record<string, string>>({});
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  // Session/Auth States
  const [currentUser, setCurrentUser] = useState<{
    role: 'parent' | 'student' | 'teacher' | 'admin';
    name: string;
  } | null>(null);

  const [aiLoading, setAiLoading] = useState(false);

  // Initialize and load states on mount
  useEffect(() => {
    setClasses(getSavedState('classes', INITIAL_CLASSES));
    setTeachers(getSavedState('teachers', INITIAL_TEACHERS));
    setStudents(getSavedState('students', INITIAL_STUDENTS));
    setGrades(getSavedState('grades', INITIAL_GRADES));
    setAbsences(getSavedState('absences', INITIAL_ABSENCES));
    setHomeworks(getSavedState('homework', INITIAL_HOMEWORK));
    setAnnouncements(getSavedState('announcements', INITIAL_ANNOUNCEMENTS));
    setPayments(getSavedState('payments', INITIAL_PAYMENTS));
    setSchedules(getSavedState('schedules', INITIAL_SCHEDULES));
    setMessages(getSavedState('messages', INITIAL_MESSAGES));
    setAiAnalyses(getSavedState('ai_analyses', []));
    
    // Load notification and photo stores
    setNotifications(getSavedState('educonnect_notifications', DEFAULT_NOTIFICATIONS));
    setProfilePhotos(getSavedState('educonnect_profile_photos', {}));

    const savedTheme = localStorage.getItem('educonnect_theme');
    const initialTheme = savedTheme === 'dark'; // Thème clair d'abord par défaut
    setIsDarkMode(initialTheme);
    if (initialTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Auto-login loaded session if available
    const cachedSession = localStorage.getItem('educonnect_session');
    if (cachedSession) {
      setCurrentUser(JSON.parse(cachedSession));
    }
  }, []);

  // 2. Save updates triggered in child dashboards to local persistent engine
  useEffect(() => {
    if (classes.length > 0) saveState('classes', classes);
  }, [classes]);

  useEffect(() => {
    if (teachers.length > 0) saveState('teachers', teachers);
  }, [teachers]);

  useEffect(() => {
    if (students.length > 0) saveState('students', students);
  }, [students]);

  useEffect(() => {
    if (grades.length > 0) saveState('grades', grades);
  }, [grades]);

  useEffect(() => {
    if (absences.length > 0) saveState('absences', absences);
  }, [absences]);

  useEffect(() => {
    if (homeworks.length > 0) saveState('homework', homeworks);
  }, [homeworks]);

  useEffect(() => {
    if (announcements.length > 0) saveState('announcements', announcements);
  }, [announcements]);

  useEffect(() => {
    if (payments.length > 0) saveState('payments', payments);
  }, [payments]);

  useEffect(() => {
    if (messages.length > 0) saveState('messages', messages);
  }, [messages]);

  useEffect(() => {
    if (aiAnalyses.length > 0) saveState('ai_analyses', aiAnalyses);
  }, [aiAnalyses]);

  useEffect(() => {
    saveState('educonnect_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveState('educonnect_profile_photos', profilePhotos);
  }, [profilePhotos]);

  // Session login trigger
  const handleSelectRole = (role: 'parent' | 'student' | 'teacher' | 'admin', name: string) => {
    const session = { role, name };
    setCurrentUser(session);
    localStorage.setItem('educonnect_session', JSON.stringify(session));
  };

  // Sign out
  const handleLogOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('educonnect_session');
  };


  // Reset demo back to clean seeds
  const handleResetDemoState = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la base de données scolaire ? Cela effacera toutes les notes et absences créées pour restaurer les profils d'origine.")) {
      resetAppStateToDefault();
      localStorage.removeItem('educonnect_session');
      window.location.reload();
    }
  };

  // MUTATION WORKFLOWS FOR DATA STORES
  const handleAddMessage = (content: string, receiverId: string, customSenderName?: string, customSenderRole?: 'parent' | 'teacher' | 'student' | 'admin') => {
    if (!currentUser) return;
    
    // Find receiver name
    let receiverName = '';
    let receiverRole: any = 'teacher';

    if (currentUser.role === 'parent') {
      const teacher = teachers.find(t => t.id === receiverId);
      receiverName = teacher ? teacher.name : 'Enseignant';
      receiverRole = 'teacher';
    } else {
      // sender is teacher, receiver is student's parent
      const student = students.find(s => s.id === receiverId);
      receiverName = student ? student.parentName : 'Parent';
      receiverRole = 'parent';
    }

    const newMsg: SchoolMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.role === 'parent' ? 'parent_id' : (teachers.find(t => t.name === currentUser.name)?.id || 'teacher_id'),
      senderName: customSenderName || currentUser.name,
      senderRole: customSenderRole || currentUser.role,
      receiverId,
      receiverName,
      receiverRole,
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
  };

  const handleJustifyAbsence = (absenceId: string, justificationText: string) => {
    setAbsences(prev => prev.map(abs => {
      if (abs.id === absenceId) {
        return {
          ...abs,
          justified: true,
          justificationText
        };
      }
      return abs;
    }));
  };

  const handlePayPayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0],
          receiptNo: `FAC-REGL-${Math.floor(1000 + Math.random() * 9000)}`
        };
      }
      return p;
    }));
  };

  const handleToggleHomework = (homeworkId: string) => {
    if (!currentUser) return;
    
    // Find active student id
    const activeStudentId = students.find(s => s.name === currentUser.name || s.parentName === currentUser.name)?.id || 's1';

    setHomeworks(prev => prev.map(hw => {
      if (hw.id === homeworkId) {
        const alreadyDone = hw.completedBy.includes(activeStudentId);
        return {
          ...hw,
          completedBy: alreadyDone 
            ? hw.completedBy.filter(id => id !== activeStudentId)
            : [...hw.completedBy, activeStudentId]
        };
      }
      return hw;
    }));
  };

  const handleUpdateProfilePhoto = (username: string, base64: string) => {
    setProfilePhotos(prev => ({
      ...prev,
      [username]: base64
    }));
  };

  const handleAddNotification = (title: string, content: string, type: 'grade' | 'homework' | 'announcement', targetRole: 'parent' | 'student' | 'teacher' | 'admin' | 'all' = 'all') => {
    const newNotif: SchoolNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(3,7)}`,
      title,
      content,
      type,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      targetRole
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = (role: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.targetRole === 'all' || n.targetRole === role) {
        return { ...n, isRead: true };
      }
      return n;
    }));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAddGrade = (gradeData: Omit<Grade, 'id' | 'isValidated'>) => {
    const newGrade: Grade = {
      ...gradeData,
      id: `g_${Date.now()}_${Math.random().toString(36).substring(3,7)}`,
      isValidated: false // Must be validated by admin!
    };
    setGrades(prev => [...prev, newGrade]);
    
    handleAddNotification(
      'Nouvelle Note Saisie ! 📊',
      `Un devoir de ${gradeData.subject} (${gradeData.title}) pour un coefficient de ${gradeData.coefficient} a été enregistré par l'enseignant. En attente de validation administrative.`,
      'grade',
      'teacher'
    );
  };

  const handleAddAbsence = (absenceData: Omit<Absence, 'id'>) => {
    const newAbs: Absence = {
      ...absenceData,
      id: `a_${Date.now()}`
    };
    setAbsences(prev => [...prev, newAbs]);
  };

  const handlePublishHomework = (homeworkData: Omit<Homework, 'id' | 'completedBy'>) => {
    const newHw: Homework = {
      ...homeworkData,
      id: `h_${Date.now()}`,
      completedBy: []
    };
    setHomeworks(prev => [...prev, newHw]);

    handleAddNotification(
      'Nouveau Devoir Publié 📝',
      `Un devoir en ${homeworkData.subject} (${homeworkData.title}) est en ligne. À rendre pour le ${homeworkData.dueDate}.`,
      'homework',
      'student'
    );
  };

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'registrationNumber' | 'historicalYears'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `s_${Date.now()}`,
      registrationNumber: `REG-2026-${Math.floor(100 + Math.random() * 900)}`,
      historicalYears: ['Inscrit en 2026']
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleAddTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t_${Date.now()}`
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const handleValidateGrade = (gradeId: string) => {
    setGrades(prev => prev.map(g => {
      if (g.id === gradeId) {
        const studentObj = students.find(s => s.id === g.studentId);
        const nameText = studentObj ? studentObj.name : 'votre enfant';
        handleAddNotification(
          'Nouvelle Note Validée 🎉',
          `La note du devoir "${g.title}" en ${g.subject} (${g.value}/20) a été officiellement approuvée par l'administration pour ${nameText}.`,
          'grade',
          'parent'
        );
        return { ...g, isValidated: true };
      }
      return g;
    }));
  };

  const handlePublishAnnouncement = (annData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `an_${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements(prev => [newAnn, ...prev]);

    handleAddNotification(
      'Nouvelle Annonce Publiée ! 📢',
      `${annData.title} par ${annData.author}`,
      'announcement',
      'all'
    );
  };

  const handleSignAllBulletins = (classId: string) => {
    // We mark all grades from this class as verified/signed
    const classStudentIds = students.filter(s => s.classId === classId).map(s => s.id);
    const className = classes.find(c => c.id === classId)?.name || 'la classe';
    setGrades(prev => prev.map(g => {
      if (classStudentIds.includes(g.studentId)) {
        return { ...g, isValidated: true };
      }
      return g;
    }));

    handleAddNotification(
      'Bulletins Scolaires Signés ✍️',
      `La directrice a signé électroniquement et validé tous les bulletins de ${className}.`,
      'grade',
      'parent'
    );
  };

  // PREMIUM MODULE: Trigger Gemini analysis of student performance
  const handleTriggerAIAnalysis = async (
    studentId: string, 
    studentName: string, 
    classLevel: string, 
    studentGrades: Grade[], 
    behavior: string
  ) => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName,
          classLevel,
          grades: studentGrades.map(g => ({ subject: g.subject, value: g.value })),
          attendance: absences.filter(a => a.studentId === studentId),
          behavior
        })
      });

      if (!response.ok) {
        throw new Error("Impossible d'obtenir une réponse de l'API IA");
      }

      const report: Omit<AIAnalysisResult, 'studentId' | 'timestamp'> = await response.json();
      
      const fullReport: AIAnalysisResult = {
        ...report,
        studentId,
        timestamp: new Date().toISOString()
      };

      // Append or replace
      setAiAnalyses(prev => {
        const filtered = prev.filter(r => r.studentId !== studentId);
        return [...filtered, fullReport];
      });

    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Une erreur est survenue lors de l'analyse intelligente des performances scolaires. Le système rebascule automatiquement sur les diagnostics locaux temporaires.");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const nextTheme = !prev;
      localStorage.setItem('educonnect_theme', nextTheme ? 'dark' : 'light');
      if (nextTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nextTheme;
    });
  };

  // Render Role Select gateway if not logged in
  if (!currentUser) {
    return (
      <RoleSelect 
        students={students}
        teachers={teachers}
        onSelectRole={handleSelectRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  // Find accurate models for active session
  const activeStudent = students.find(s => s.name === currentUser.name);
  const activeTeacher = teachers.find(t => t.name === currentUser.name);

  const visibleNotifications = notifications.filter(n => {
    if (!currentUser) return false;
    return n.targetRole === 'all' || n.targetRole === currentUser.role;
  });

  const unreadCount = visibleNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-200">
      {/* Dynamic persistent Header for simulations */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-805 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500 text-white rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50 block tracking-tight">EduConnect</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Portail Éducatif de Suivi en Temps Réel</span>
            </div>
          </div>

          {/* Quick Info & Notifications & Theme Controls */}
          <div className="flex items-center flex-wrap justify-center lg:justify-end gap-3 text-xs w-full lg:w-auto">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition cursor-pointer shrink-0"
              title="Basculer le thème"
              id="theme-toggler-btn"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2 relative text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition cursor-pointer shrink-0"
                title="Notifications"
                id="notification-bell-btn"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 bg-zinc-55 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-850 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Centre d'Alertes</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => handleMarkAllAsRead(currentUser.role)}
                        className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline font-bold cursor-pointer font-sans"
                        id="mark-all-read-btn"
                      >
                        Tout marquer lu
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-zinc-105 dark:divide-zinc-850">
                    {visibleNotifications.length === 0 ? (
                      <div className="py-8 px-4 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                        Aucune notification active
                      </div>
                    ) : (
                      visibleNotifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-3 text-xs transition relative group ${
                            notif.isRead 
                              ? 'bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400' 
                              : 'bg-teal-50/50 dark:bg-teal-955/20 text-zinc-905 dark:text-zinc-200 font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold pr-5">{notif.title}</span>
                            <div className="flex gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                              {!notif.isRead && (
                                <button 
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="text-[10px] text-teal-600 dark:text-teal-450 hover:text-teal-700 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-705 rounded p-0.5 cursor-pointer"
                                  title="Lu"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteNotification(notif.id)}
                                className="text-[10px] text-red-500 hover:text-red-700 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-705 rounded p-0.5 cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">{notif.content}</p>
                          <span className="block mt-1 text-[9px] text-zinc-400 dark:text-zinc-550 font-mono">{notif.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="text-zinc-450 dark:text-zinc-550 hidden sm:inline shrink-0">|</span>

            {/* User Profile Info Badge */}
            <button
              onClick={() => setShowUserProfileModal(true)}
              className="flex items-center gap-2 pr-1.5 focus:outline-none hover:opacity-90 active:scale-95 transition-all text-left cursor-pointer group"
              id="header-profile-badge"
              title="Consulter mon Profil"
            >
              <div className="relative shrink-0">
                {profilePhotos[currentUser.name] ? (
                  <img 
                    src={profilePhotos[currentUser.name]} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-teal-500 shadow-3xs shrink-0 group-hover:ring-2 ring-teal-300 ring-offset-1 dark:ring-offset-zinc-950 transition-all" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-850 flex items-center justify-center text-xs font-extrabold shrink-0 group-hover:ring-2 ring-teal-300 ring-offset-1 dark:ring-offset-zinc-950 transition-all">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-left text-[11px] hidden md:block select-none leading-none shrink-0 border-r border-zinc-200 dark:border-zinc-800 pr-2 mr-1">
                <span className="font-extrabold text-zinc-900 dark:text-zinc-50 block mb-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{currentUser.name}</span>
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold uppercase tracking-wider block">
                  {currentUser.role === 'parent' ? 'Parent' : currentUser.role === 'student' ? 'Élève' : currentUser.role === 'teacher' ? 'Enseignant' : 'Directeur'}
                </span>
              </div>
            </button>

            {/* Quick logout & DB clear */}
            <button
              onClick={handleLogOut}
              className="px-3 py-1.5 bg-zinc-150 hover:bg-zinc-205 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition flex items-center gap-1 font-bold text-[11px] cursor-pointer shrink-0"
              id="header-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Changer d'espace</span>
            </button>

            <button
              onClick={handleResetDemoState}
              className="p-1.5 md:p-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-105 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition shrink-0 cursor-pointer"
              title="Réinitialiser"
              id="header-reset-db-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Dynamic content router */}
        {currentUser.role === 'parent' && (
          <DashboardParent
            parentName={currentUser.name}
            students={students}
            grades={grades}
            absences={absences}
            homeworks={homeworks}
            announcements={announcements}
            payments={payments}
            messages={messages}
            teachers={teachers}
            schedules={schedules}
            aiAnalyses={aiAnalyses}
            onAddMessage={handleAddMessage}
            onJustifyAbsence={handleJustifyAbsence}
            onPayPayment={handlePayPayment}
            onTriggerAI={handleTriggerAIAnalysis}
            aiLoading={aiLoading}
            userPhoto={profilePhotos[currentUser.name]}
            onUpdatePhoto={(b64) => handleUpdateProfilePhoto(currentUser.name, b64)}
          />
        )}

        {currentUser.role === 'student' && activeStudent && (
          <DashboardStudent
            student={activeStudent}
            grades={grades}
            homeworks={homeworks}
            schedules={schedules}
            onToggleHomework={handleToggleHomework}
            userPhoto={profilePhotos[currentUser.name]}
            onUpdatePhoto={(b64) => handleUpdateProfilePhoto(currentUser.name, b64)}
          />
        )}

        {currentUser.role === 'teacher' && activeTeacher && (
          <DashboardTeacher
            teacher={activeTeacher}
            classes={classes}
            students={students}
            grades={grades}
            absences={absences}
            homeworks={homeworks}
            messages={messages}
            onAddGrade={handleAddGrade}
            onAddAbsence={handleAddAbsence}
            onPublishHomework={handlePublishHomework}
            onAddMessage={handleAddMessage}
            userPhoto={profilePhotos[currentUser.name]}
            onUpdatePhoto={(b64) => handleUpdateProfilePhoto(currentUser.name, b64)}
          />
        )}

        {currentUser.role === 'admin' && (
          <DashboardAdmin
            classes={classes}
            students={students}
            teachers={teachers}
            grades={grades}
            announcements={announcements}
            onAddStudent={handleAddStudent}
            onAddTeacher={handleAddTeacher}
            onAddClassRoom={onAddClassRoom => setClasses(prev => [...prev, { ...onAddClassRoom, id: `c_${Date.now()}` }])}
            onValidateGrade={handleValidateGrade}
            onPublishAnnouncement={handlePublishAnnouncement}
            onSignAllBulletins={handleSignAllBulletins}
            userPhoto={profilePhotos[currentUser.name]}
            onUpdatePhoto={(b64) => handleUpdateProfilePhoto(currentUser.name, b64)}
          />
        )}
      </main>

      {/* Persistent humble Footer wrapping up layout */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-805 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 EduConnect France • Tous droits réservés.</p>
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Serveur sécurisé d'établissement agrégé par Intelligence Artificielle</span>
          </div>
        </div>
      </footer>

      {/* Dynamic profile view modal overlay */}
      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        currentUser={currentUser}
        students={students}
        teachers={teachers}
        classes={classes}
        grades={grades}
        homeworks={homeworks}
        userPhoto={profilePhotos[currentUser?.name || ''] || ''}
        onUpdatePhoto={(b64) => handleUpdateProfilePhoto(currentUser?.name || '', b64)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    </div>
  );
}
