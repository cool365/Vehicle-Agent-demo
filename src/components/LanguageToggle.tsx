import { Languages } from 'lucide-react';
import type { Language } from '../i18n';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: () => void;
}

export function LanguageToggle({ currentLang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg hover:bg-slate-700/80 transition-all duration-200 shadow-lg"
    >
      <Languages className="w-5 h-5 text-blue-400" />
      <span className="text-sm font-medium text-slate-200">
        {currentLang === 'zh' ? '中文' : 'English'}
      </span>
    </button>
  );
}
