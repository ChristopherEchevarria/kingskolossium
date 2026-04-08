/***
Path:/kingskolossium/src/features/arena/ArenaPage.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Root layout — mode toggle + conditional render
***/

import { ModeToggle } from './components/ModeToggle';
import { CombatMode } from './components/CombatMode';
import { useArenaStore } from './stores/arenaStore';

export function ArenaPage() {
  const { mode } = useArenaStore();

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4">
      <div className="w-full flex flex-col gap-3 overflow-hidden" style={{ maxWidth: '60%' }}>

        <h2 className="text-center text-app-blue font-mono text-2xl font-bold">
          Arena
        </h2>

        <ModeToggle />

        {mode === 'combat' && <CombatMode />}

        {mode === 'build' && (
          <div className="liquid-glass rounded-xl p-8 text-center">
            <p className="text-white/60 font-mono text-sm">
              Build mode — components coming soon
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default ArenaPage;