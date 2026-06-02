import React, { useState } from 'react';
import { Student, Teacher } from '../types';
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'motion/react';

interface RoleSelectProps {
  students: Student[];
  teachers: Teacher[];
  onSelectRole: (role: 'parent' | 'student' | 'teacher' | 'admin', name: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function RoleSelect({
  students,
  teachers,
  onSelectRole,
  isDarkMode,
  onToggleDarkMode
}: RoleSelectProps) {
  const [selectedRole, setSelectedRole] = useState<'parent' | 'student' | 'teacher' | 'admin' | null>(null);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative" id="role-gateway-container">
      {/* Quick Theme Toggle on top right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          title="Basculer le thème"
          id="role-theme-toggle"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
      {/* Decorative Brand Header */}
      <div className="text-center space-y-2 mb-8 max-w-md animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-teal-500 text-white rounded-2xl shadow-sm hover:scale-105 transition-transform">
            <GraduationCap className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
          EduConnect
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Plateforme numérique d'apprentissage scolaire, de suivi en temps réel et d'audit cognitif par IA.
        </p>
      </div>

      {/* Main card box */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm max-w-md w-full space-y-6">
        {!selectedRole ? (
          <>
            <h3 className="text-sm font-bold uppercase font-mono text-zinc-400 dark:text-zinc-500 tracking-wider text-center">
              Sélectionnez votre Espace d'accès
            </h3>
            
            <div className="space-y-3">
              {[
                { id: 'parent', label: 'Espace Parents', desc: 'Consulter notes, bulletins, retards & justifs', icon: Users, color: 'bg-emerald-50 text-emerald-700 hover:border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-350 dark:hover:border-emerald-800' },
                { id: 'student', label: 'Espace Élèves', desc: 'Accéder aux exercices, notes & emplois de temps', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-700 hover:border-indigo-300 dark:bg-indigo-950/20 dark:text-indigo-350 dark:hover:border-indigo-800' },
                { id: 'teacher', label: 'Espace Enseignants', desc: 'Saisir notes, présences & cahiers de classe', icon: UserCheck, color: 'bg-teal-50 text-teal-700 hover:border-teal-300 dark:bg-teal-950/20 dark:text-teal-350 dark:hover:border-teal-800' },
                { id: 'admin', label: 'Espace Administration / Direction', desc: 'Gérer dossiers, homologuer notes, signature électronique', icon: ShieldAlert, color: 'bg-rose-50 text-rose-700 hover:border-rose-300 dark:bg-rose-950/20 dark:text-rose-350 dark:hover:border-rose-800' }
              ].map(role => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      if (role.id === 'admin') {
                        // Admin has only 1 option
                        onSelectRole('admin', 'Directeur Moreau');
                      } else {
                        setSelectedRole(role.id as any);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition cursor-pointer text-left ${role.color}`}
                    id={`gateway-role-select-${role.id}`}
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                       <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 shadow-3xs shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-snug">{role.label}</h4>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-normal">{role.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
              >
                &larr; Retour
              </button>
              <span className="text-xs text-zinc-300 dark:text-zinc-750">|</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Changer d'espace</span>
            </div>

            <h3 className="text-sm font-bold uppercase font-mono text-zinc-400 dark:text-zinc-500 tracking-wider text-left">
              Choisissez un compte de simulation
            </h3>

            <div className="space-y-2">
              {selectedRole === 'parent' && students.map(student => (
                <button
                  key={student.id}
                  onClick={() => onSelectRole('parent', student.parentName)}
                  className="w-full p-4 border border-zinc-150 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/55 hover:bg-white dark:hover:bg-zinc-900 hover:border-teal-400 dark:hover:border-teal-555 text-left text-xs font-semibold text-zinc-750 dark:text-zinc-300 transition block cursor-pointer"
                  id={`parent-simulate-btn-${student.id}`}
                >
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-105">{student.parentName}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">Responsable légal de {student.name} ({student.classId === 'c1' ? '6ème A' : student.classId === 'c2' ? '5ème B' : student.classId === 'c3' ? '3ème Alpha' : 'Terminale S1'})</p>
                </button>
              ))}

              {selectedRole === 'student' && students.map(student => (
                <button
                  key={student.id}
                  onClick={() => onSelectRole('student', student.name)}
                  className="w-full p-4 border border-zinc-150 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/55 hover:bg-white dark:hover:bg-zinc-900 hover:border-teal-400 dark:hover:border-teal-555 text-left text-xs font-semibold text-zinc-750 dark:text-zinc-300 transition block cursor-pointer"
                  id={`student-simulate-btn-${student.id}`}
                >
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-105">{student.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">Élève de la classe : {student.classId === 'c1' ? '6ème A' : student.classId === 'c2' ? '5ème B' : student.classId === 'c3' ? '3ème Alpha' : 'Terminale S1'}</p>
                </button>
              ))}

              {selectedRole === 'teacher' && teachers.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => onSelectRole('teacher', teacher.name)}
                  className="w-full p-4 border border-zinc-150 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/55 hover:bg-white dark:hover:bg-zinc-900 hover:border-teal-400 dark:hover:border-teal-555 text-left text-xs font-semibold text-zinc-750 dark:text-zinc-300 transition block cursor-pointer"
                  id={`teacher-simulate-btn-${teacher.id}`}
                >
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-105">{teacher.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">Enseigne : {teacher.subjects.join(', ')}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-sans">
          <span>Simulation de démo Sandbox</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-500" />
            <span>EduConnect 2026</span>
          </span>
        </div>
      </div>
    </div>
  );
}
