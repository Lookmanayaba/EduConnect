import React, { useRef, useState } from 'react';
import { Upload, FileImage, X } from 'lucide-react';

interface FileInputProps {
  onImageSelected: (base64: string) => void;
  currentImage?: string;
  id?: string;
}

export default function FileInput({ 
  onImageSelected, 
  currentImage, 
  id = 'file-input' 
}: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide (PNG, JPG, BMP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("La taille de l'image ne doit pas dépasser 2 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onImageSelected(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelected('');
  };

  return (
    <div className="w-full flex flex-col items-center gap-3" id={`container-${id}`}>
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500 shadow-md">
          <img 
            src={preview} 
            alt="Aperçu du profil" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1"
          >
            <X className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`w-full p-6 py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 select-none ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50/10' 
              : 'border-zinc-200 dark:border-zinc-800 hover:border-teal-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
          }`}
        >
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl">
            <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center">
            Glissez-déposez ou cliquez pour ajouter une photo
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Fichiers PNG ou JPG jusqu'à 2Mo
          </p>
        </div>
      )}
    </div>
  );
}
