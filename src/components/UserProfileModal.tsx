import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Key, 
  Bookmark, 
  Briefcase, 
  Award,
  BookOpen,
  MapPin,
  CheckCircle,
  Copy,
  Layout,
  Clock,
  Check,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Teacher, ClassRoom, Grade, Homework } from '../types';
import FileInput from './FileInput';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    role: 'parent' | 'student' | 'teacher' | 'admin';
    name: string;
  } | null;
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  grades: Grade[];
  homeworks: Homework[];
  userPhoto: string;
  onUpdatePhoto: (base64: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  students,
  teachers,
  classes,
  grades,
  homeworks,
  userPhoto,
  onUpdatePhoto,
  isDarkMode,
  onToggleDarkMode
}: UserProfileModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'academic' | 'security'>('info');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(identifier);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Find detailed models corresponding to the currentUser
  const matchingTeacher = currentUser?.role === 'teacher' 
    ? teachers.find(t => t.name === currentUser.name) 
    : null;

  const matchingStudent = currentUser?.role === 'student'
    ? students.find(s => s.name === currentUser.name)
    : null;

  const linkedStudents = currentUser?.role === 'parent'
    ? students.filter(s => s.parentName === currentUser.name)
    : [];

  // Academic values calculations
  const getStudentAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.isValidated);
    if (studentGrades.length === 0) return null;
    const total = studentGrades.reduce((acc, g) => acc + (g.value * g.coefficient), 0);
    const coeffs = studentGrades.reduce((acc, g) => acc + g.coefficient, 0);
    return coeffs > 0 ? (total / coeffs) : null;
  };

  return (
    <AnimatePresence>
      {isOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="profile-modal-overlay">
          {/* Animated backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />

          {/* Modal card wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-zinc-150 dark:border-zinc-800 shadow-2xl z-10 flex flex-col max-h-[90vh]"
            id="profile-modal-card"
          >
            {/* Header Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 dark:from-teal-950 dark:via-emerald-950 dark:to-cyan-950 relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition cursor-pointer z-20"
                id="profile-modal-close-btn"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute -bottom-10 left-6 sm:left-8 flex items-end gap-4">
                <div className="relative group">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={currentUser.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white dark:border-zinc-900 bg-zinc-150 dark:bg-zinc-800 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border-4 border-white dark:border-zinc-900 flex items-center justify-center text-3xl font-extrabold shadow-md">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div 
                    onClick={() => setActiveSubTab('security')}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white cursor-pointer transition"
                    title="Changer ma photo"
                  >
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/90 text-teal-700 shadow-2xs">
                    {currentUser.role === 'admin' && 'Direction'}
                    {currentUser.role === 'teacher' && 'Enseignant'}
                    {currentUser.role === 'student' && 'Élève'}
                    {currentUser.role === 'parent' && 'Parent'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-xs mt-1">
                    {currentUser.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Spacer for avatar offset */}
            <div className="h-10 flex-shrink-0" />

            {/* Navigation tabs */}
            <div className="px-6 sm:px-8 border-b border-zinc-100 dark:border-zinc-805 flex gap-4 text-xs font-bold text-zinc-400 select-none flex-shrink-0">
              <button
                onClick={() => setActiveSubTab('info')}
                className={`py-3.5 border-b-2 transition-colors relative cursor-pointer ${
                  activeSubTab === 'info' 
                    ? 'border-teal-500 text-teal-600 dark:text-teal-450' 
                    : 'border-transparent hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
                id="profile-tab-info"
              >
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Mon Profil</span>
                </div>
              </button>
              <button
                onClick={() => setActiveSubTab('academic')}
                className={`py-3.5 border-b-2 transition-colors relative cursor-pointer ${
                  activeSubTab === 'academic' 
                    ? 'border-teal-500 text-teal-600 dark:text-teal-450' 
                    : 'border-transparent hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
                id="profile-tab-academic"
              >
                <div className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Structure & Scolarité</span>
                </div>
              </button>
              <button
                onClick={() => setActiveSubTab('security')}
                className={`py-3.5 border-b-2 transition-colors relative cursor-pointer ${
                  activeSubTab === 'security' 
                    ? 'border-teal-500 text-teal-600 dark:text-teal-450' 
                    : 'border-transparent hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
                id="profile-tab-security"
              >
                <div className="flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5" />
                  <span>Photo & Thème</span>
                </div>
              </button>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-6">
              
              {/* SUB-TAB: INFO */}
              {activeSubTab === 'info' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                  id="profile-tabpanel-info"
                >
                  {/* General Personal Details Panel */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-3xs space-y-4">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider font-mono">
                      Fiche d'identité numérique
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Role specific detail rows */}
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-1">
                        <span className="text-zinc-400 block font-semibold">Nom complet</span>
                        <strong className="text-zinc-850 dark:text-zinc-100 font-bold block">{currentUser.name}</strong>
                      </div>

                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-1">
                        <span className="text-zinc-400 block font-semibold">Statut au sein du Lycée</span>
                        <span className="text-teal-700 dark:text-teal-400 font-mono font-bold block capitalize">
                          {currentUser.role === 'admin' ? 'Directeur Principal' : currentUser.role}
                        </span>
                      </div>

                      {/* Email field with dynamic copier */}
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-1 relative group">
                        <span className="text-zinc-400 block font-semibold">Adresse Électronique académique</span>
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                          <span className="text-zinc-850 dark:text-zinc-200 truncate pr-6 font-semibold font-mono">
                            {matchingTeacher?.email || 
                             matchingStudent?.parentEmail || 
                             (currentUser.role === 'admin' ? 'direction@educonnect.fr' : 'contact@scolaire.educonnect.fr')}
                          </span>
                          <button
                            onClick={() => handleCopy(
                              matchingTeacher?.email || matchingStudent?.parentEmail || 'contact@scolaire.educonnect.fr', 
                              'email'
                            )}
                            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                            title="Copier l'adresse email"
                          >
                            {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Phone details */}
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-1 relative">
                        <span className="text-zinc-400 block font-semibold">Ligne sécurisée</span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-zinc-855 dark:text-zinc-200 font-mono font-semibold">
                            {matchingStudent?.parentPhone || '+33 (0) 6 99 22 41 85'}
                          </span>
                          <button
                            onClick={() => handleCopy(matchingStudent?.parentPhone || '+33 (0) 6 99 22 41 85', 'phone')}
                            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                            title="Copier le numéro"
                          >
                            {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regional/Location details */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-3xs flex items-start gap-4">
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50">Localisation générale de l'établissement</h4>
                      <p className="text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-semibold">
                        Lycée Polyvalent d'Établissement Principal, Académie d'Orléans-Tours, France. <br />
                        Hébergement sécurisé agréé CNIL.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SUB-TAB: SCOOLING/ACADEMIC DETAILS */}
              {activeSubTab === 'academic' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                  id="profile-tabpanel-academic"
                >
                  {/* ADMIN CARD */}
                  {currentUser.role === 'admin' && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl shadow-3xs space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Rôle Direction & Management</h4>
                          <p className="text-[11px] text-zinc-400">Droits d'administration centralisés autorisés</p>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                          <span className="text-zinc-400 text-[10px] uppercase font-mono block">Volume En l'établissement</span>
                          <p className="text-zinc-800 dark:text-zinc-100 mt-1">{students.length} Élèves inscrits • {teachers.length} Directeurs / Enseignants</p>
                        </div>
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                          <span className="text-zinc-400 text-[10px] uppercase font-mono block">Signature Numérique</span>
                          <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Certifiée Active
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TEACHER DETAIL SPECIFICS */}
                  {currentUser.role === 'teacher' && (
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-3xs space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase font-mono dark:text-zinc-400">
                          Périmètre d'enseignement scolaire
                        </h4>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-zinc-400 block font-semibold mb-1">Matières Enseignées au Programme</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {matchingTeacher?.subjects.map(subj => (
                                <span key={subj} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-850 dark:text-teal-300 font-bold rounded-lg border border-teal-100 dark:border-teal-900/30">
                                  {subj}
                                </span>
                              )) || <span className="text-zinc-400">Aucune matière enregistrée</span>}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-zinc-400 block font-semibold mb-1.5">Classes Assignées au Professeur ({matchingTeacher?.classIds.length || 0})</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {matchingTeacher?.classIds.map(cid => {
                                const classroom = classes.find(c => c.id === cid);
                                if (!classroom) return null;
                                return (
                                  <div key={cid} className="p-2.5 bg-zinc-55 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-805 rounded-xl flex items-center justify-between">
                                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{classroom.name}</span>
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400">{classroom.level}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STUDENT DETAIL SPECIFICS */}
                  {currentUser.role === 'student' && matchingStudent && (
                    <div className="space-y-4">
                      {/* Card stats for Student */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl shadow-3xs text-center space-y-1">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono block">Moyenne Générale</span>
                          <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">
                            {getStudentAverage(matchingStudent.id)?.toFixed(2) || '--'}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl shadow-3xs text-center space-y-1">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono block">Classe</span>
                          <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-100 block">
                            {classes.find(c => c.id === matchingStudent.classId)?.name || 'Inconnue'}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl shadow-3xs text-center space-y-1">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono block">Inscriptions</span>
                          <span className="text-xs font-mono font-semibold text-zinc-550 dark:text-zinc-400 block">
                            {matchingStudent.registrationNumber}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-3xs text-xs space-y-3">
                        <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 font-sans">Dossier académique et Historiques</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 bg-zinc-55 dark:bg-zinc-950 p-3 rounded-xl font-semibold">
                            <span className="text-[10px] text-zinc-400 block">Années d'historique enregistrées</span>
                            <p className="text-zinc-700 dark:text-zinc-300">{matchingStudent.historicalYears.join(', ')}</p>
                          </div>
                          <div className="space-y-1 bg-zinc-55 dark:bg-zinc-950 p-3 rounded-xl font-semibold">
                            <span className="text-[10px] text-zinc-400 block">Date de naissance officielle</span>
                            <p className="text-zinc-700 dark:text-zinc-300 font-serif">{matchingStudent.birthDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PARENT DETAIL SPECIFICS */}
                  {currentUser.role === 'parent' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                        Pupilles rattachés à votre profil ({linkedStudents.length})
                      </h4>

                      {linkedStudents.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-400 italic bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl">
                          Aucun élève rattaché trouvé dans notre base.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {linkedStudents.map(student => {
                            const avg = getStudentAverage(student.id);
                            return (
                              <div key={student.id} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl shadow-3xs flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div className="text-xs">
                                    <h5 className="font-extrabold text-zinc-900 dark:text-zinc-50">{student.name}</h5>
                                    <p className="text-zinc-400 mt-0.5">
                                      Classe : {classes.find(c => c.id === student.classId)?.name} • Matr: {student.registrationNumber}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right text-xs">
                                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono block">Moyenne</span>
                                  <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {avg ? `${avg.toFixed(2)} / 20` : 'Pas de note'}
                                  </strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* SUB-TAB: SECURITY AND PHOTO EDITOR */}
              {activeSubTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                  id="profile-tabpanel-security"
                >
                  {/* Photo editor widget */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-3xs space-y-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 font-sans">
                        Photo de profil d'Établissement
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Personnalisez votre avatar numérique pour faciliter l'identification par l'équipe pédagogique.
                      </p>
                    </div>

                    <div className="py-2">
                      <FileInput
                        onImageSelected={onUpdatePhoto}
                        currentImage={userPhoto}
                        id="unified-profile-modal-photo-input"
                      />
                    </div>
                  </div>

                  {/* Nice system settings card */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-3xs space-y-4 text-xs">
                    <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 font-sans">Préférences de l'application</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-zinc-55 dark:bg-zinc-950 rounded-xl">
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Thème sombre de l'interface</span>
                        <p className="text-[10px] text-zinc-400">Basculer entre les modes d'affichage clair ou sombre.</p>
                      </div>

                      <button
                        onClick={onToggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                          isDarkMode ? 'bg-[#00A896]' : 'bg-zinc-350'
                        }`}
                        id="profile-theme-toggle"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Quick Footer Action Row */}
            <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-805 flex justify-end flex-shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                id="profile-modal-confirm-btn"
              >
                Fermer ma fiche
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
