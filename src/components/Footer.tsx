import React from 'react';
import { GraduationCap, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-10 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-200">StudentPath RAG Engine</span>
          <span className="text-slate-500">| Grounded Internship & Scholarship Discovery</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span>Powered by LangChain, FastAPI & ChromaDB</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Students
          </span>
        </div>
      </div>
    </footer>
  );
};
