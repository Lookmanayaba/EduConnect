import React, { useState } from 'react';
import { 
  Student, 
  Teacher, 
  ClassRoom, 
  Grade, 
  Announcement 
} from '../types';
import { 
  Users, 
  BookMarked, 
  GraduationCap, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Megaphone, 
  Plus, 
  UserCheck, 
  FolderLock, 
  BarChart4, 
  Vote,
  Signature,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FileInput from './FileInput';

interface DashboardAdminProps {
  classes: ClassRoom[];
  students: Student[];
  teachers: Teacher[];
  grades: Grade[];
  announcements: Announcement[];
  onAddStudent: (studentData: Omit<Student, 'id' | 'registrationNumber' | 'historicalYears'>) => void;
  onAddTeacher: (teacherData: Omit<Teacher, 'id'>) => void;
  onAddClassRoom: (classData: Omit<ClassRoom, 'id'>) => void;
  onValidateGrade: (gradeId: string) => void;
  onPublishAnnouncement: (announcementData: Omit<Announcement, 'id' | 'date'>) => void;
  onSignAllBulletins: (classId: string) => void;
  userPhoto?: string;
  onUpdatePhoto?: (base64: string) => void;
}

export default function DashboardAdmin({
  classes,
  students,
  teachers,
  grades,
  announcements,
  onAddStudent,
  onAddTeacher,
  onAddClassRoom,
  onValidateGrade,
  onPublishAnnouncement,
  onSignAllBulletins,
  userPhoto,
  onUpdatePhoto
}: DashboardAdminProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'students' | 'teachers' | 'grades_validation' | 'announcements'>('stats');
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

  React.useEffect(() => {
    const element = document.getElementById('admin-tab-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // FORM STATES: ADD STUDENT
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newSName, setNewSName] = useState('');
  const [newSClassId, setNewSClassId] = useState(classes[0]?.id || '');
  const [newSParentName, setNewSParentName] = useState('');
  const [newSParentEmail, setNewSParentEmail] = useState('');
  const [newSParentPhone, setNewSParentPhone] = useState('');
  const [newSBirth, setNewSBirth] = useState('');

  // FORM STATES: ADD TEACHER
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTName, setNewTName] = useState('');
  const [newTSubjs, setNewTSubjs] = useState('');
  const [newTEmail, setNewTEmail] = useState('');

  // FORM STATES: GLOBAL ANNOUNCEMENT
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnAuthor, setNewAnnAuthor] = useState('Directeur Moreau');

  // BULLETIN SIGNATURE STATES
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureClassId, setSignatureClassId] = useState(classes[0]?.id || '');
  const [signedState, setSignedState] = useState<Record<string, boolean>>({});

  // Calculations
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  
  const validatedGrades = grades.filter(g => g.isValidated);
  const pendingGrades = grades.filter(g => !g.isValidated);

  const globalGPA = validatedGrades.length > 0
    ? validatedGrades.reduce((sum, g) => sum + g.value, 0) / validatedGrades.length
    : 12.55;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName.trim() || !newSParentName.trim() || !newSParentEmail.trim() || !newSBirth) {
      alert("Veuillez remplir tous les champs de l'étudiant.");
      return;
    }

    onAddStudent({
      name: newSName,
      classId: newSClassId,
      parentName: newSParentName,
      parentEmail: newSParentEmail,
      parentPhone: newSParentPhone || '06 00 00 00 00',
      birthDate: newSBirth
    });

    alert(`Fiche d'étudiant créée et affectée à la classe !`);
    setNewSName('');
    setNewSParentName('');
    setNewSParentEmail('');
    setNewSParentPhone('');
    setNewSBirth('');
    setShowAddStudent(false);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTName.trim() || !newTEmail.trim() || !newTSubjs.trim()) {
      alert("Veuillez remplir les informations de l'enseignant.");
      return;
    }

    onAddTeacher({
      name: newTName,
      email: newTEmail,
      subjects: newTSubjs.split(',').map(s => s.trim()),
      classIds: []
    });

    alert("Compte d'enseignement créé avec succès. Affectations en attente.");
    setNewTName('');
    setNewTEmail('');
    setNewTSubjs('');
    setShowAddTeacher(false);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      alert("L'annonce doit posséder un titre et un descriptif.");
      return;
    }

    onPublishAnnouncement({
      title: newAnnTitle,
      content: newAnnContent,
      author: newAnnAuthor,
      role: 'Administration'
    });

    alert("L'annonce administrative a été diffusée en temps réel.");
    setNewAnnTitle('');
    setNewAnnContent('');
    setShowAddAnn(false);
  };

  const handleSignBulletins = (classId: string) => {
    onSignAllBulletins(classId);
    setSignedState({ ...signedState, [classId]: true });
    setShowSignatureModal(false);
    alert(`Tous les bulletins de la classe ont reçu la signature électronique certifiée par clé d'administration.`);
  };

  return (
    <div className="space-y-6 pb-28" id="dashboard-admin-container">
      {/* Visual Admin Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt="Profil Direction" 
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm shrink-0" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-200 dark:border-teal-850 shrink-0">
              AD
            </div>
          )}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-55/60 dark:bg-teal-950/40 px-2 rounded-md py-1 inline-block mb-1">
              Espace Directoire
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Espace Administration</h1>
              <button
                onClick={() => setShowPhotoEditor(!showPhotoEditor)}
                className="inline-flex self-start sm:self-auto items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-805 text-teal-600 dark:text-teal-400 border border-zinc-200 dark:border-zinc-750 rounded-lg transition-all cursor-pointer"
                id="admin-add-photo-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{userPhoto ? 'Changer ma photo' : 'Ajouter ma photo'}</span>
              </button>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Pilotage académique, approbation des bilans & signature électronique des bulletins.</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex gap-2">
          {/* Sign PDF bulletins and report cards */}
          <button 
            onClick={() => setShowSignatureModal(true)}
            className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            id="bulletin-signer-btn"
          >
            <Signature className="w-4 h-4 text-teal-600" />
            <span>Signer Bulletins</span>
          </button>
          
          <button
            onClick={() => setShowAddAnn(true)}
            className="px-4 py-1.5 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-3xs transition flex items-center gap-1.5 cursor-pointer"
            id="add-announcement-btn"
          >
            <Megaphone className="w-4 h-4" />
            <span>Faire une Annonce</span>
          </button>
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
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-250 text-xs font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
          <FileInput 
            onImageSelected={(b64) => {
              if (onUpdatePhoto) onUpdatePhoto(b64);
            }} 
            currentImage={userPhoto} 
            id="admin-profile-photo-input"
          />
        </motion.div>
      )}


      {/* Global metrics banners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-3xs">
          <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-500">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">Effectif Élèves</span>
            <Users className="w-5 h-5 text-teal-500" />
          </div>
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2 block">{totalStudents}</span>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Répartis sur {totalClasses} classes actives</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-3xs">
          <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-500">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">Membres du personnel</span>
            <UserCheck className="w-5 h-5 text-teal-500" />
          </div>
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2 block">{totalTeachers}</span>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Professeurs agrégés en ligne</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-3xs">
          <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-500">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">Moyenne Générale</span>
            <BarChart4 className="w-5 h-5 text-teal-500" />
          </div>
          <span className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-2 block">{globalGPA.toFixed(2)}/20</span>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Niveau d'excellence global</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-3xs">
          <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-500">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">Notes en attente</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2 block">{pendingGrades.length}</span>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Négligeables avant arbitrage</p>
        </div>
      </div>

      {/* Floating Bottom App Navigation Bar (inspired strictly by mockups) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl bg-zinc-950/95 backdrop-blur-md rounded-full py-2.5 px-3 shadow-2xl border border-zinc-800 flex items-center justify-between gap-1">
        {[
          { id: 'stats', label: 'Suivi', icon: BarChart4 },
          { id: 'students', label: 'Élèves', icon: GraduationCap },
          { id: 'teachers', label: 'Professeurs', icon: Users },
          { id: 'grades_validation', label: 'Validation', icon: CheckCircle },
          { id: 'announcements', label: 'Annonces', icon: Megaphone }
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
              id={`admin-tab-btn-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabAdmin"
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

      {/* Main Tab area */}
      <div className="min-h-[380px] scroll-mt-24" id="admin-tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="admin-stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Classes summary lists with student counters */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-3xs">
                <h3 className="text-sm font-semibold text-zinc-800 mb-4">Vue synthétique des classes de l'établissement</h3>
                
                <div className="space-y-4">
                  {classes.map(cl => {
                    const clStudents = students.filter(s => s.classId === cl.id);
                    const clGrades = grades.filter(g => clStudents.map(s => s.id).includes(g.studentId) && g.isValidated);
                    const classGPA = clGrades.length > 0 
                      ? clGrades.reduce((sum, g) => sum + g.value, 0) / clGrades.length 
                      : 12.0;

                    return (
                      <div key={cl.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-800">{cl.name}</h4>
                          <span className="text-xs text-zinc-400 font-mono">Type : {cl.level} • {clStudents.length} élèves inscrits</span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs text-zinc-400 font-sans">Moyenne de classe :</span>
                          <span className="text-sm font-bold text-teal-700 block font-mono">{classGPA.toFixed(2)}/20</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Administrative note block */}
              <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1">
                    <FolderLock className="w-5 h-5 text-teal-400" />
                    <span>Dossiers Académiques</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                    L'ensemble des fiches de scolarité, inscriptions annuelles et d'affectation réglementaires sont protégées et archivées selon le standard RGPD scolaire.
                  </p>
                </div>
                
                <div className="border-t border-zinc-800 mt-6 pt-4 text-xs text-zinc-500">
                  <span>Année Scolaire courante : <strong>2025-2026</strong></span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STUDENTS management tab */}
          {activeTab === 'students' && (
            <motion.div
              key="admin-students"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-zinc-800">Registre Global des Élèves</h3>
                <button
                  onClick={() => setShowAddStudent(!showAddStudent)}
                  className="px-4 py-2 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                  id="admin-new-student-trigger"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Dossier Élève</span>
                </button>
              </div>

              {/* Add student collapsible form */}
              {showAddStudent && (
                <form onSubmit={handleStudentSubmit} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-4" id="add-student-form">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Nom complet de l'élève</label>
                    <input 
                      type="text" 
                      placeholder="ex: Paul Desmoulins"
                      value={newSName}
                      onChange={(e) => setNewSName(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Classe d'affectation</label>
                    <select
                      value={newSClassId}
                      onChange={(e) => setNewSClassId(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none font-semibold"
                    >
                      {classes.map(cl => (
                        <option key={cl.id} value={cl.id}>{cl.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Nom du Responsable Parent</label>
                    <input 
                      type="text" 
                      placeholder="ex: Mme Hélène Desmoulins"
                      value={newSParentName}
                      onChange={(e) => setNewSParentName(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Date de naissance</label>
                    <input 
                      type="date" 
                      value={newSBirth}
                      onChange={(e) => setNewSBirth(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Email du Parent</label>
                    <input 
                      type="email" 
                      placeholder="ex: helene.desmoulins@gmail.com"
                      value={newSParentEmail}
                      onChange={(e) => setNewSParentEmail(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Téléphone de contact</label>
                    <input 
                      type="text" 
                      placeholder="ex: 06 11 22 33 44"
                      value={newSParentPhone}
                      onChange={(e) => setNewSParentPhone(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 text-right pt-2 border-t border-zinc-200">
                    <button type="submit" className="px-5 py-2.5 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition">
                      Enregistrer le dossier scolaire
                    </button>
                  </div>
                </form>
              )}

              {/* Students grid directory */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => {
                  const sClass = classes.find(c => c.id === student.classId)?.name || 'Non affecté';
                  return (
                    <div key={student.id} className="bg-white p-5 border border-zinc-100 rounded-2xl hover:border-teal-200 transition relative overflow-hidden shadow-2xs">
                      <span className="text-[9px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-400 absolute right-4 top-4">
                        {student.registrationNumber}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-800 mb-1">{student.name}</h4>
                      <p className="text-xs text-teal-700 font-semibold mb-3">Classe: {sClass}</p>
                      
                      <div className="space-y-1 text-xs text-zinc-500 font-sans border-t border-zinc-100 pt-3">
                        <p><strong>Parent :</strong> {student.parentName}</p>
                        <p><strong>Contact :</strong> {student.parentPhone}</p>
                        <p><strong>E-mail :</strong> {student.parentEmail}</p>
                        <p><strong>Né(e) le :</strong> {student.birthDate}</p>
                      </div>

                      {student.historicalYears?.length > 0 && (
                        <div className="mt-3 bg-zinc-50/50 p-2 rounded-lg text-[10px] text-zinc-400 font-sans">
                          <strong>Parcours antérieur:</strong> {student.historicalYears.join(' • ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TEACHERS management tab */}
          {activeTab === 'teachers' && (
            <motion.div
              key="admin-teachers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-zinc-800">Membres de l'Équipe Pédagogique</h3>
                <button
                  onClick={() => setShowAddTeacher(!showAddTeacher)}
                  className="px-4 py-2 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                  id="admin-new-teacher-trigger"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Professeur</span>
                </button>
              </div>

              {/* Add teacher collapsible form */}
              {showAddTeacher && (
                <form onSubmit={handleTeacherSubmit} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-4" id="add-teacher-form">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Nom complet du Professeur</label>
                    <input 
                      type="text" 
                      placeholder="ex: M. François Gérard"
                      value={newTName}
                      onChange={(e) => setNewTName(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Matières (séparées par virgules)</label>
                    <input 
                      type="text" 
                      placeholder="ex: Littérature, Langues"
                      value={newTSubjs}
                      onChange={(e) => setNewTSubjs(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 block mb-1">Adresse E-mail académique</label>
                    <input 
                      type="email" 
                      placeholder="ex: francois.gerard@educonnect.fr"
                      value={newTEmail}
                      onChange={(e) => setNewTEmail(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-2 border border-zinc-200 rounded-lg outline-none"
                    />
                  </div>
                  <div className="md:col-span-3 text-right pt-1 border-t border-zinc-200">
                    <button type="submit" className="px-5 py-2 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition">
                      Enregistrer l'enseignant
                    </button>
                  </div>
                </form>
              )}

              {/* Teachers grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="bg-white dark:bg-zinc-900 p-5 border border-zinc-100 dark:border-zinc-850 rounded-2xl hover:border-teal-200 dark:hover:border-teal-800 transition relative overflow-hidden shadow-2xs">
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl w-fit mb-3">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{teacher.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{teacher.email}</p>
                    
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">Matières Enseignées :</span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map(subj => (
                          <span key={subj} className="text-[10px] bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-medium">
                            {subj}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block font-sans">
                        Classes assignées : <strong>{teacher.classIds.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ') || 'Aucune'}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* GRADES VALIDATION workflow */}
          {activeTab === 'grades_validation' && (
            <motion.div
              key="admin-validation"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-155">Files d'Attented de validation administrative</h3>
                <p className="text-xs text-zinc-400">Pour assurer la sincérité des notes scolaires, veuillez approuver les évaluations saisies par les enseignants ci-dessous.</p>
              </div>

              <div className="space-y-3">
                {pendingGrades.map(grade => {
                  const student = students.find(s => s.id === grade.studentId);
                  const teacher = teachers.find(t => t.id === grade.teacherId);
                  return (
                    <div key={grade.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-150 dark:border-zinc-800 gap-4 hover:bg-zinc-100/50 dark:hover:bg-zinc-805/40 transition">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Évaluation : {grade.title}</h4>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            Saisie par <strong className="text-zinc-600 dark:text-zinc-300">{teacher?.name || 'Professeur'}</strong> pour l'élève <strong className="text-zinc-650 dark:text-zinc-300">{student?.name || 'Élève'}</strong> ({classes.find(c => c.id === student?.classId)?.name || 'Classe'})
                          </p>
                          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 block">Matière: {grade.subject} • Coeff: {grade.coefficient} • Saisi le {grade.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono text-zinc-900 dark:text-zinc-105 font-bold text-sm block bg-white dark:bg-zinc-900 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                          {grade.value.toFixed(1)} / 20
                        </span>
                        
                        <button
                          onClick={() => onValidateGrade(grade.id)}
                          className="px-4 py-2 bg-[#00A896] hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                          id={`validate-grade-btn-${grade.id}`}
                        >
                          Approuver
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pendingGrades.length === 0 && (
                  <div className="text-center py-12 text-zinc-400 italic text-xs">
                    Aucune fiche trimestrielle n'est en attente de signature d'homologation.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ANNOUNCEMENTS history logs */}
          {activeTab === 'announcements' && (
            <motion.div
              key="admin-announcements"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Historique des communications diffusées</h3>
                <button
                  onClick={() => setShowAddAnn(!showAddAnn)}
                  className="px-4 py-11.5 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  id="admin-form-announcement-trigger"
                >
                  <Plus className="w-4 h-4" />
                  <span>Faire une Annonce</span>
                </button>
              </div>

              {/* Add collapsible Announcement form */}
              {showAddAnn && (
                <form onSubmit={handleAnnouncementSubmit} className="bg-zinc-50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4" id="post-announcement-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-450 block mb-1">Titre de l'Avis de publication</label>
                      <input 
                        type="text" 
                        placeholder="ex: Fermeture de la demi-pension pour travaux"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-455 block mb-1">Auteur émetteur</label>
                      <input 
                        type="text" 
                        value={newAnnAuthor}
                        onChange={(e) => setNewAnnAuthor(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-100 text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-450 block mb-1">Contenu textuel détaillé</label>
                    <textarea 
                      placeholder="Rédigez l'annonce textuelle officielle devant être retransmise à l'ensemble des parents et de la communauté..."
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      rows={4}
                      className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
                    />
                  </div>
                  <div className="text-right">
                    <button type="submit" className="px-5 py-2.5 bg-[#00A896] hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition">
                      Diffuser l'annonce
                    </button>
                  </div>
                </form>
              )}

              {/* Announcements list */}
              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 rounded-2xl border border-zinc-150 dark:border-zinc-800 transition animate-fade-in">
                    <span className="text-[10px] font-bold text-[#00A896] font-mono tracking-wider uppercase block mb-1">
                      Option Diffusée le : {ann.date} par {ann.author}
                    </span>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{ann.title}</h4>
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COMPREHENSIVE ELECTRONIC SIGNATURE MODAL */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="signature-modal">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 max-w-md w-full p-6 space-y-4 relative">
            <button 
              onClick={() => setShowSignatureModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex gap-3 bg-teal-50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-100 dark:border-teal-900/45 text-teal-800 dark:text-teal-300">
              <Signature className="w-8 h-8 text-teal-600 dark:text-teal-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Signature Électronique Certifiée</h4>
                <p className="text-xs text-teal-700 dark:text-teal-400 mt-1 leading-relaxed">
                  Cette procédure appose le cachet d'authenticité numérique officiel du Directeur sur les bulletins scolaires de la classe choisie.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">Sélectionner la classe à homologuer :</label>
              <select
                value={signatureClassId}
                onChange={(e) => setSignatureClassId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {classes.map(cl => (
                  <option key={cl.id} value={cl.id}>{cl.name} ({cl.level})</option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 border border-zinc-250 hover:bg-zinc-50 rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
              <button
                onClick={() => handleSignBulletins(signatureClassId)}
                className="px-4 py-2 bg-[#00A896] hover:bg-teal-600 text-white rounded-xl text-xs font-bold"
                id="execute-signature-btn"
              >
                Signer & Publier Définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
