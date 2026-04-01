/***
Path:/kingskolossium/src/features/header/components/HamburgerMenu.tsx
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: Slide-out panel — inert when logged out, interactive when logged in
***/

import { useHeaderStore } from '../stores/headerStore';

interface HamburgerMenuProps {
  isLoggedIn: boolean;
  nickname?:  string;
  onLogout:   () => void;
}

export function HamburgerMenu({ isLoggedIn, nickname, onLogout }: HamburgerMenuProps) {
  const { menuOpen, toggleMenu, closeMenu } = useHeaderStore();

  // When logged out, the button renders but the panel does nothing interactive
  const canOpen = isLoggedIn;

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
          <div className={`fixed top-0 right-0 h-full w-72 liquid-glass-strong z-50
                           flex flex-col transform transition-transform duration-300
                           ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* User info */}
            <div className="p-4 border-b border-white/10">
              <div className="w-14 h-14 rounded-full bg-app-blue/30 mx-auto mb-2" />
              <p className="text-center text-white font-mono text-sm">
                {nickname ?? 'Guest'}
              </p>
            </div>

            {/* Expandable features area — placeholder */}
            <div className="flex-1 p-4">
              <p className="text-white/50 text-xs font-mono">Features coming soon…</p>
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