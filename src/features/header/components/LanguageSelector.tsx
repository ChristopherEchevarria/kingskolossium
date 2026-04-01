/***
Path:/kingskolossium/src/features/header/components/LanguageSelector.tsx
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: Flag icon + dropdown (US/FR/ES)
***/

import { useState, useRef, useEffect } from 'react';
import { useHeaderStore, type Language } from '../stores/headerStore';

// Flag emojis — no asset files needed
const FLAGS: Record<Language, { emoji: string; label: string }> = {
  en: { emoji: '🇺🇸', label: 'English'  },
  fr: { emoji: '🇫🇷', label: 'Français' },
  es: { emoji: '🇪🇸', label: 'Español'  },
};

export function LanguageSelector() {
  const { language, setLanguage } = useHeaderStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const others = (Object.keys(FLAGS) as Language[]).filter((l) => l !== language);

  return (
    <div ref={ref} className="relative">
      {/* Current flag button */}
      <button
        onClick={() => setOpen(!open)}
        className="text-xl leading-none hover:scale-110 transition-transform duration-150"
        title={FLAGS[language].label}
      >
        {FLAGS[language].emoji}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 right-0 liquid-glass rounded-lg p-1 flex flex-col gap-0.5 z-50 min-w-[120px]">
          {others.map((lang) => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md
                         hover:bg-app-blue/30 transition-colors duration-100
                         text-white/80 hover:text-white"
            >
              <span className="text-lg leading-none">{FLAGS[lang].emoji}</span>
              <span className="text-xs font-mono">{FLAGS[lang].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;