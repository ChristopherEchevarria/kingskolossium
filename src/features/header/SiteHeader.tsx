/***
Path:/kingskolossium/src/features/header/SiteHeader.tsx
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: Main header component — logo stub (v1.02 Step 1)
***/

import websiteLogo from '../../assets/header/website_logo.svg';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full liquid-glass">
      <div className="max-w-screen-xl mx-auto flex items-center h-14 px-4">
        {/* Logo — hugs left */}
        <img
          src={websiteLogo}
          alt="Kings Kolossium"
          className="h-8 w-auto shrink-0"
        />
      </div>
    </header>
  );
}

export default SiteHeader;