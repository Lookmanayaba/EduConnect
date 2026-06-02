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
  ScheduleEvent 
} from './types';

// Initial constants
export const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'c1', name: '6ème A', level: 'Collège' },
  { id: 'c2', name: '5ème B', level: 'Collège' },
  { id: 'c3', name: '3ème Alpha', level: 'Collège' },
  { id: 'c4', name: 'Terminale S1', level: 'Lycée' }
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: 'M. Jean Robert', subjects: ['Mathématiques'], email: 'jean.robert@educonnect.fr', classIds: ['c1', 'c3', 'c4'] },
  { id: 't2', name: 'Mme Sophie Laurent', subjects: ['Physique-Chimie', 'Sciences'], email: 'sophie.laurent@educonnect.fr', classIds: ['c2', 'c4'] },
  { id: 't3', name: 'Mme Marie Mercier', subjects: ['Français', 'Histoire-Géo'], email: 'marie.mercier@educonnect.fr', classIds: ['c1', 'c2', 'c3'] }
];

export const INITIAL_STUDENTS: Student[] = [
  { 
    id: 's1', 
    name: 'Lucas Martin', 
    classId: 'c1', 
    parentName: 'Sophie Martin', 
    parentEmail: 'sophie.martin@gmail.com', 
    parentPhone: '06 12 34 56 78', 
    birthDate: '2014-04-12', 
    registrationNumber: 'REG-2024-001', 
    historicalYears: ['CM1 (2022-2023)', 'CM2 (2023-2024)'] 
  },
  { 
    id: 's2', 
    name: 'Chloé Dubois', 
    classId: 'c2', 
    parentName: 'Pierre Dubois', 
    parentEmail: 'pierre.dubois@gmail.com', 
    parentPhone: '06 98 76 54 32', 
    birthDate: '2013-09-25', 
    registrationNumber: 'REG-2202-045', 
    historicalYears: ['6ème A (2024-2025)'] 
  },
  { 
    id: 's3', 
    name: 'Amadou Diallo', 
    classId: 'c4', 
    parentName: 'Mamadou Diallo', 
    parentEmail: 'mamadou.diallo@outlook.com', 
    parentPhone: '07 55 43 21 09', 
    birthDate: '2008-01-08', 
    registrationNumber: 'REG-2021-112', 
    historicalYears: ['2nde C (2023-2024)', '1ère S2 (2024-2025)'] 
  },
  { 
    id: 's4', 
    name: 'Inès Lefebvre', 
    classId: 'c3', 
    parentName: 'Marc Lefebvre', 
    parentEmail: 'marc.lefebvre@wanadoo.fr', 
    parentPhone: '06 33 22 11 00', 
    birthDate: '2011-06-30', 
    registrationNumber: 'REG-2022-809', 
    historicalYears: ['6ème B (2023-2024)', '5ème C (2024-2025)'] 
  }
];

export const INITIAL_GRADES: Grade[] = [
  // s1 (Lucas Martin, 6ème A - Jean Robert / Marie Mercier)
  { id: 'g1', studentId: 's1', subject: 'Mathématiques', value: 14.5, coefficient: 2, date: '2026-05-15', title: 'Contrôle Algèbre', quarter: 3, teacherId: 't1', isValidated: true },
  { id: 'g2', studentId: 's1', subject: 'Mathématiques', value: 11, coefficient: 1, date: '2026-05-28', title: 'Interrogation Équations', quarter: 3, teacherId: 't1', isValidated: true },
  { id: 'g3', studentId: 's1', subject: 'Français', value: 12.5, coefficient: 2, date: '2026-05-10', title: 'Dictée & Grammaire', quarter: 3, teacherId: 't3', isValidated: true },
  { id: 'g4', studentId: 's1', subject: 'Français', value: 13, coefficient: 1.5, date: '2026-05-22', title: 'Rédaction Description', quarter: 3, teacherId: 't3', isValidated: true },
  { id: 'g5', studentId: 's1', subject: 'Histoire-Géo', value: 15, coefficient: 1, date: '2026-05-18', title: 'Quiz Géographie Physique', quarter: 3, teacherId: 't3', isValidated: true },

  // s2 (Chloé Dubois, 5ème B - Sophie Laurent / Marie Mercier - in difficulty)
  { id: 'g6', studentId: 's2', subject: 'Sciences', value: 8.5, coefficient: 2, date: '2026-05-12', title: 'Évaluation Biologie', quarter: 3, teacherId: 't2', isValidated: true },
  { id: 'g7', studentId: 's2', subject: 'Sciences', value: 9.5, coefficient: 1, date: '2026-05-27', title: 'TP Systèmes Solaires', quarter: 3, teacherId: 't2', isValidated: true },
  { id: 'g8', studentId: 's2', subject: 'Français', value: 9, coefficient: 2, date: '2026-05-14', title: 'Analyse de Texte', quarter: 3, teacherId: 't3', isValidated: true },
  { id: 'g9', studentId: 's2', subject: 'Français', value: 11, coefficient: 1, date: '2026-05-29', title: 'Oral Poésie', quarter: 3, teacherId: 't3', isValidated: true },
  { id: 'g10', studentId: 's2', subject: 'Histoire-Géo', value: 7, coefficient: 1, date: '2026-05-20', title: 'Contrôle Moyen-Âge', quarter: 3, teacherId: 't3', isValidated: true },

  // s3 (Amadou Diallo, Terminale S1 - Excellent student)
  { id: 'g11', studentId: 's3', subject: 'Mathématiques', value: 18.5, coefficient: 5, date: '2026-05-10', title: 'Bac Blanc Analyse', quarter: 3, teacherId: 't1', isValidated: true },
  { id: 'g12', studentId: 's3', subject: 'Mathématiques', value: 17, coefficient: 3, date: '2026-05-26', title: 'DS Matrices', quarter: 3, teacherId: 't1', isValidated: true },
  { id: 'g13', studentId: 's3', subject: 'Physique-Chimie', value: 16.5, coefficient: 4, date: '2026-05-14', title: 'Thermodynamique', quarter: 3, teacherId: 't2', isValidated: true },
  { id: 'g14', studentId: 's3', subject: 'Physique-Chimie', value: 19, coefficient: 2, date: '2026-05-28', title: 'DS Électromagnétisme', quarter: 3, teacherId: 't2', isValidated: true },

  // s4 (Inès Lefebvre, 3ème Alpha)
  { id: 'g15', studentId: 's4', subject: 'Mathématiques', value: 13, coefficient: 3, date: '2026-05-11', title: 'Brevet Blanc Algèbre', quarter: 3, teacherId: 't1', isValidated: true },
  { id: 'g16', studentId: 's4', subject: 'Français', value: 15.5, coefficient: 3, date: '2026-05-18', title: 'Brevet Blanc Rédaction', quarter: 3, teacherId: 't3', isValidated: true },
  { id: 'g17', studentId: 's4', subject: 'Histoire-Géo', value: 14, coefficient: 2, date: '2026-05-25', title: 'Contrôle Guerres Mondiales', quarter: 3, teacherId: 't3', isValidated: true }
];

export const INITIAL_ABSENCES: Absence[] = [
  { id: 'a1', studentId: 's2', date: '2026-05-11', type: 'absence', duration: 'Journée entière', reason: 'Maladie (gastro)', justified: true, justificationText: 'Certificat médical fourni le 12/05', quarter: 3 },
  { id: 'a2', studentId: 's2', date: '2026-05-25', type: 'delay', duration: '20 min', reason: 'Panne de réveil', justified: false, quarter: 3 },
  { id: 'a3', studentId: 's1', date: '2026-05-18', type: 'delay', duration: '10 min', reason: 'Problème de bus de transport', justified: true, justificationText: 'Mot des parents signé sur le carnet électronique', quarter: 3 },
  { id: 'a4', studentId: 's4', date: '2026-05-20', type: 'absence', duration: 'Toute la matinée', reason: 'Rendez-vous orthodontiste', justified: true, justificationText: 'Justificatif du cabinet dentaire scanné', quarter: 3 }
];

export const INITIAL_HOMEWORK: Homework[] = [
  { 
    id: 'h1', 
    classId: 'c1', 
    subject: 'Mathématiques', 
    title: 'Exercices Théorème de Thalès', 
    description: 'Faire les exercices 14, 15 et 18 de la page 112 du manuel d\'activités. En cas de doute, revoir la fiche de proportionnalité du chapitre précédent.', 
    dueDate: '2026-06-04', 
    completedBy: ['s1'] 
  },
  { 
    id: 'h2', 
    classId: 'c1', 
    subject: 'Français', 
    title: 'Lecture cursive et résumé de chapitre', 
    description: 'Lire les chapitres 3, 4 et 5 du Livre de la Jungle. Rédiger un court paragraphe de synthèse (80-120 mots) résumant les péripéties de Mowgli face à Shere Khan.', 
    dueDate: '2026-06-06', 
    completedBy: [] 
  },
  { 
    id: 'h3', 
    classId: 'c2', 
    subject: 'Sciences', 
    title: 'Schéma légendé du cycle de l\'eau', 
    description: 'Tracer sur feuille de dessin ou logiciel graphique un schéma complet légendé du cycle naturel de l\'eau en indiquant les états physiques (évaporation, condensation, précipitation, infiltration).', 
    dueDate: '2026-06-05', 
    completedBy: [] 
  },
  { 
    id: 'h4', 
    classId: 'c4', 
    subject: 'Mathématiques', 
    title: 'DS d\'entraînement : Dérivées et Intégrales', 
    description: 'Résoudre les problèmes types n°5 à n°9 d\'annales du bac. Transmettre votre copie scannée au format PDF sous forme de fichier attaché.', 
    dueDate: '2026-06-03', 
    completedBy: ['s3'],
    fileName: 'exos_integration_terminales.pdf'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { 
    id: 'an1', 
    title: 'Réunions Parents-Enseignants du 3ème Trimestre', 
    content: 'Les rencontres individuelles de fin d\'année auront lieu le vendredi 12 juin scolaires de 16h30 à 20h. Veuillez réserver vos créneaux horaires d\'entretien directement depuis l\'onglet messagerie de votre espace auprès des professeurs principaux respectifs de vos enfants.', 
    date: '2026-06-01', 
    author: 'Directeur Moreau', 
    role: 'Administration/Directeur' 
  },
  { 
    id: 'an2', 
    title: 'Élections du Conseil d\'Administration des Élèves', 
    content: 'La campagne officielle de dépôt de candidatures pour le bureau d\'association des élèves de l\'année prochaine se clôture ce jeudi soir. Rappelons que tous les collégiens et lycéens sont éligibles pour voter le 8 juin.', 
    date: '2026-05-31', 
    author: 'CPE Mme Dupuy', 
    role: 'Administration' 
  },
  { 
    id: 'an3', 
    title: 'Sortie Éco-Responsable & Biodiversité en Forêt', 
    content: 'Toutes les classes de 6ème et 5ème participeront à la journée d\'étude écosystémique le mardi 9 juin au Parc National Régional. Prévoir des chaussures de marche fermées, un vêtement imperméable, et un repas froid à emporter. Pensez à ramener l\'autorisation parentale signée.', 
    date: '2026-05-30', 
    author: 'Mme Sophie Laurent', 
    role: 'Enseignant/Sciences' 
  }
];

export const INITIAL_PAYMENTS: SchoolPayment[] = [
  { id: 'p1', studentId: 's1', title: 'Frais d\'inscription annuelle 2025-2026', amount: 150.00, dueDate: '2025-09-15', paidDate: '2025-09-12', status: 'paid', receiptNo: 'FAC-2025-9981' },
  { id: 'p2', studentId: 's1', title: 'Frais de cantine - Mai 2026', amount: 65.00, dueDate: '2026-05-05', paidDate: '2026-05-04', status: 'paid', receiptNo: 'FAC-2026-4412' },
  { id: 'p3', studentId: 's1', title: 'Frais de cantine & Demi-pension - Juin 2026', amount: 65.00, dueDate: '2026-06-05', status: 'pending' },
  
  { id: 'p4', studentId: 's2', title: 'Frais de cantine - Mai 2026', amount: 58.00, dueDate: '2026-05-05', status: 'overdue' },
  { id: 'p5', studentId: 's2', title: 'Sortie Éco-Responsable Forêt', amount: 12.00, dueDate: '2026-06-05', status: 'pending' },
  
  { id: 'p6', studentId: 's3', title: 'Frais de scolarité Lycée - Trimestre 3', amount: 320.00, dueDate: '2026-05-30', paidDate: '2026-05-28', status: 'paid', receiptNo: 'FAC-2026-3829' },
  { id: 'p7', studentId: 's4', title: 'Livre de mathématiques spécialisé (Achat collectif)', amount: 25.00, dueDate: '2026-06-10', status: 'pending' }
];

export const INITIAL_SCHEDULES: ScheduleEvent[] = [
  // 6ème A
  { id: 'sch1', classId: 'c1', subject: 'Mathématiques', teacherName: 'M. Jean Robert', room: 'Salle 102', dayOfWeek: 1, startTime: '08:15', endTime: '10:00', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'sch2', classId: 'c1', subject: 'Français', teacherName: 'Mme Marie Mercier', room: 'Salle 204', dayOfWeek: 1, startTime: '10:15', endTime: '12:00', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'sch3', classId: 'c1', subject: 'Histoire-Géo', teacherName: 'Mme Marie Mercier', room: 'Salle 204', dayOfWeek: 2, startTime: '08:15', endTime: '10:00', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'sch4', classId: 'c1', subject: 'Mathématiques', teacherName: 'M. Jean Robert', room: 'Salle 102', dayOfWeek: 3, startTime: '10:15', endTime: '12:00', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'sch5', classId: 'c1', subject: 'Français', teacherName: 'Mme Marie Mercier', room: 'Salle 104', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'sch6', classId: 'c1', subject: 'Histoire-Géo', teacherName: 'Mme Marie Mercier', room: 'Salle 204', dayOfWeek: 5, startTime: '09:00', endTime: '11:00', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  
  // 5ème B
  { id: 'sch7', classId: 'c2', subject: 'Sciences', teacherName: 'Mme Sophie Laurent', room: 'Phy-Lab 1', dayOfWeek: 1, startTime: '10:15', endTime: '12:00', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'sch8', classId: 'c2', subject: 'Français', teacherName: 'Mme Marie Mercier', room: 'Salle 101', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'sch9', classId: 'c2', subject: 'Histoire-Géo', teacherName: 'Mme Marie Mercier', room: 'Salle 101', dayOfWeek: 3, startTime: '08:15', endTime: '10:00', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'sch10', classId: 'c2', subject: 'Sciences', teacherName: 'Mme Sophie Laurent', room: 'Phy-Lab 1', dayOfWeek: 4, startTime: '10:15', endTime: '12:00', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  
  // Terminale S1
  { id: 'sch11', classId: 'c4', subject: 'Mathématiques', teacherName: 'M. Jean Robert', room: 'Salle Bac 2', dayOfWeek: 1, startTime: '08:15', endTime: '10:00', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'sch12', classId: 'c4', subject: 'Physique-Chimie', teacherName: 'Mme Sophie Laurent', room: 'Labo Ph-Ch', dayOfWeek: 1, startTime: '14:00', endTime: '17:00', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'sch13', classId: 'c4', subject: 'Mathématiques', teacherName: 'M. Jean Robert', room: 'Salle Bac 2', dayOfWeek: 2, startTime: '10:15', endTime: '12:00', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'sch14', classId: 'c4', subject: 'Physique-Chimie', teacherName: 'Mme Sophie Laurent', room: 'Labo Ph-Ch', dayOfWeek: 3, startTime: '08:15', endTime: '10:00', color: 'bg-teal-50 text-teal-700 border-teal-200' }
];

export const INITIAL_MESSAGES: SchoolMessage[] = [
  { id: 'm1', senderId: 't1', senderName: 'M. Jean Robert', senderRole: 'teacher', receiverId: 's1', receiverName: 'Sophie Martin', receiverRole: 'parent', content: 'Bonjour Mme Martin. Lucas s\'investit bien dans les cours d\'algèbre mais reste discret. Son dernier devoir est très encourageant.', timestamp: '2026-05-29T10:14:00Z' },
  { id: 'm2', senderId: 's1', senderName: 'Sophie Martin', senderRole: 'parent', receiverId: 't1', receiverName: 'M. Jean Robert', receiverRole: 'teacher', content: 'Merci M. Robert de votre retour bienveillant. Je vais veiller à ce qu\'il maintienne son rigoureux travail à la maison.', timestamp: '2026-05-29T14:30:22Z' },
  { id: 'm3', senderId: 't2', senderName: 'Mme Sophie Laurent', senderRole: 'teacher', receiverId: 's2', receiverName: 'Pierre Dubois', receiverRole: 'parent', content: 'Bonjour M. Dubois. Chloé parait fatiguée ces temps-ci et les évaluations scientifiques marquent un arrêt sensible. S\'entraîne-t-elle régulièrement ?', timestamp: '2026-05-30T09:12:00Z' },
  { id: 'm4', senderId: 's2', senderName: 'Pierre Dubois', senderRole: 'parent', receiverId: 't2', receiverName: 'Mme Sophie Laurent', receiverRole: 'teacher', content: 'Bonjour, effectivement, Chloé a eu des soucis de santé passagers le mois dernier. Elle récupère peu à peu, nous allons revoir les chapitres de biologie ensemble.', timestamp: '2026-05-30T16:05:00Z' }
];

// LocalStorage helpers to simulate a live database
export function getSavedState<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(`educonnect_${key}`);
    return item ? JSON.parse(item) : initialValue;
  } catch (err) {
    console.error(`Error reading key ${key} from localStorage`, err);
    return initialValue;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`educonnect_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key ${key} to localStorage`, err);
  }
}

// Global initialization helper
export function resetAppStateToDefault(): void {
  const keys = ['students', 'teachers', 'classes', 'grades', 'absences', 'homework', 'announcements', 'payments', 'messages', 'ai_analyses'];
  keys.forEach(k => localStorage.removeItem(`educonnect_${k}`));
}
