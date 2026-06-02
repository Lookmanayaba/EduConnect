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
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FileInput from './FileInput';

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

  // Group grades by subject
  const subjects = Array.from(new Set(studentGrades.map(g => g.subject)));
  const subjectAverages = subjects.map(subj => {
    const list = studentGrades.filter(g => g.subject === subj);
    const sum = list.reduce((acc, g) => acc + g.value, 0);
    return { subject: subj, average: sum / list.length, count: list.length };
  });

  const generalAverage = studentGrades.length > 0
    ? studentGrades.reduce((sum, g) => sum + g.value, 0) / studentGrades.length
    : 0;

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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {subjectAverages.map(avgObj => {
                const myGrades = studentGrades.filter(g => g.subject === avgObj.subject);
                return (
                  <div key={avgObj.subject} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xs">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">{avgObj.subject}</h3>
                      <span className="font-mono font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-350 px-2 py-0.5 rounded">
                        Moyenne: {avgObj.average.toFixed(1)}/20
                      </span>
                    </div>

                    <div className="space-y-2">
                      {myGrades.map(grade => (
                        <div key={grade.id} className="flex justify-between items-center p-2.5 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs">
                          <div>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-205 block truncate">{grade.title}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono block">Coef: {grade.coefficient} • {grade.date}</span>
                          </div>
                          
                          <span className={`font-mono font-bold text-sm ${
                            grade.value >= 14 ? 'text-emerald-600 dark:text-emerald-400' : grade.value >= 10 ? 'text-zinc-700 dark:text-zinc-300' : 'text-red-500 dark:text-red-400'
                          }`}>
                            {grade.value.toFixed(1)}/20
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs"
            >
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Mon Emploi du Temps Hebdomadaire</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(day => {
                  const dayName = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][day - 1];
                  const events = classSchedule.filter(ev => ev.dayOfWeek === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                  return (
                    <div key={day} className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
                      <h3 className="text-xs font-bold text-center border-b border-zinc-200 dark:border-zinc-800 pb-2 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        {dayName}
                      </h3>
                      <div className="space-y-2.5">
                        {events.map(ev => (
                          <div key={ev.id} className="bg-white dark:bg-zinc-900 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg shadow-3xs">
                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1">{ev.subject}</h4>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{ev.startTime} - {ev.endTime}</p>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block truncate mt-1">Salle: {ev.room}</span>
                            <span className="text-[9px] text-[#00A896] dark:text-teal-400 font-medium truncate block">{ev.teacherName}</span>
                          </div>
                        ))}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
