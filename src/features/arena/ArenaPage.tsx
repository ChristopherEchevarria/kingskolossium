/***
Path:/kingskolossium/src/features/arena/ArenaPage.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Root layout — mode toggle + conditional render
***/

import { ModeToggle } from './components/ModeToggle';
import { CombatMode } from './components/CombatMode';
import { useArenaStore } from './stores/arenaStore';

import { BuildPage } from '../build//BuildPage';

export function ArenaPage() {
  const { mode } = useArenaStore();

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4">
      <div className="w-full flex flex-col gap-3 overflow-hidden" style={{ maxWidth: '65%' }}>
        <ModeToggle />
        {mode === 'combat' && <CombatMode />}
        {mode === 'build' && (
          <div className="liquid-glass-transparent rounded-xl p-8 text-center">
          <BuildPage />

          </div>
        )}

      </div>
    </div>
  );
}

export default ArenaPage;