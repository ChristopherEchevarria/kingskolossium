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

export function SiteHeader() {

  const { badgeStatus } = useHeaderStore();
  return (
    <header className="sticky top-0 z-30 w-full liquid-glass">
      <div className="max-w-screen-xl mx-auto flex items-center h-20 px-4">
        {/* Logo — hugs left */}
        <img
          src={websiteLogo}
          alt="Kings Kolossium"
          className="h-8 w-auto shrink-0"
        />
        {/* Title + Badges — centered */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <h1 className="text-white font-mono text-lg font-bold whitespace-nowrap">
            Kings Kolossium
          </h1>
          <BadgeStrip status={badgeStatus} />
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelector />
        </div>
      </div>



    </header>
  );
}

export default SiteHeader;