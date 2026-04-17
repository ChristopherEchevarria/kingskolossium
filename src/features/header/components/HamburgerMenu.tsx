/***
Path:/kingskolossium/src/features/header/components/HamburgerMenu.tsx
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: Slide-out panel — inert when logged out, interactive when logged in
***/

import { useHeaderStore } from '../stores/headerStore';

interface HamburgerMenuProps {
  isLoggedIn: boolean;
  onLogout:   () => void;
}

export function HamburgerMenu({ isLoggedIn, onLogout }: HamburgerMenuProps) {
  const { menuOpen, toggleMenu, closeMenu, language } = useHeaderStore();

  // When logged out, the button renders but the panel does nothing interactive
  const canOpen = isLoggedIn;
  const COMING_SOON: Record<string, string> = {
      en: 'Features coming soon…',
      fr: 'Fonctionnalités bientôt disponibles…',
      es: 'Funcionalidades próximamente…',
  };

  return (
    <>
      {/* Hamburger icon */}
      <button
        onClick={canOpen ? toggleMenu : undefined}
        className={`flex flex-col justify-center gap-1 w-6 h-6 group
                    ${canOpen ? 'cursor-pointer' : 'cursor-default opacity-40'}`}
        title={canOpen ? 'Menu' : 'Log in to access menu'}
      >
        <span className={`block h-0.5 w-full bg-white rounded transition-transform duration-200
                          ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
        <span className={`block h-0.5 w-full bg-white rounded transition-opacity duration-200
                          ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-full bg-white rounded transition-transform duration-200
                          ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
      </button>
      {/* Only render panel + overlay when logged in */}
      {canOpen && (
        <>
          {/* Overlay */}
          {menuOpen && (
            <div className="fixed inset-0 bg-black/40 z-40" onClick={closeMenu} />
          )}

          {/* Slide-out panel */}
          <div className={`fixed right-0 w-72 liquid-frosted-glass z-50
                 flex flex-col transform transition-transform duration-300
                 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                 style={{ top: '80px', height: 'calc(100vh - 80px)' }}>

            {/* User info */}
            <div className="p-2 rounded-corners">
              <div className="w-14 h-14 rounded-full bg-black/30 mx-auto mb-3" />
            </div>

            {/* Expandable features area — placeholder */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="liquid-glass rounded-xl p-4">
                    <p className="text-white/50 text-xs font-mono">{COMING_SOON[language]}</p>
                </div>
              </div>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => { onLogout(); closeMenu(); }}
                className="w-full btn btn-secondary text-xs"
              >
                Log Out
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
}

export default HamburgerMenu;