/***
Path:/kingskolossium/src/features/header/SiteHeader.tsx
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: Main header component — logo stub (v1.02 Step 1)
***/

import websiteLogo from '../../assets/header/website_logo.svg';
import { BadgeStrip } from './components/BadgeStrip';
import { useHeaderStore } from './stores/headerStore';
import { LanguageSelector } from './components/LanguageSelector';
import { LoginButton }     from './components/LoginButton';
import { HamburgerMenu }   from './components/HamburgerMenu';
import { useAuthStore } from '../auth/stores/authStore';
import type { BadgeStatus } from './stores/headerStore';


export function SiteHeader() {

  const { badgeStatus } = useHeaderStore();
  const { user,isAuthenticated, logout   } = useAuthStore();
  const activeBadge = (user?.badge_status ?? badgeStatus) as BadgeStatus;
    // Hardcoded until authStore is wired in v1.04
  const isLoggedIn = isAuthenticated;
  const nickname   = user?.nickname;
  const handleLogout = logout;
  return (
    <header className="sticky top-0 z-30 w-full liquid-glass">
      <div className="max-w-screen-xl mx-auto grid grid-cols-3 items-center h-20 px-4">
        {/* Logo — hugs left */}
        <div className="flex items-center">
            <img src={websiteLogo} alt="Kings Kolossium" className="h-8 w-auto shrink-0" />
        </div>
        {/* Title + Badges — centered */}
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-white font-mono text-lg font-bold whitespace-nowrap">
            Kings Kolossium
          </h1>
          <BadgeStrip status={activeBadge} />
        </div>

        {/* Right cluster */}
        <div className="flex items-center justify-end gap-3
        ">
          <LoginButton  isLoggedIn={isLoggedIn} nickname={nickname} />
          <LanguageSelector />
          <HamburgerMenu isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;