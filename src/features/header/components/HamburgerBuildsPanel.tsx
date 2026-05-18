/***
 * Path: kingskolossium/src/features/header/components/HamburgerBuildsPanel.tsx
 * Created by: Christopher Echevarria
 * Date of creation: 14May2026
 * Purpose and Description: Scrollable list of saved BuildCards inside HamburgerMenu.
 *   Fetches GET /api/builds/mine on each menu open. Gated behind Loyal/King badge.
 ***/

import { useEffect, useState }  from 'react';
import { listMyBuilds }         from '../../../api/builds';
import { BuildCard }            from '../../build/components/BuildCard';
import { useArenaStore }        from '../../arena/stores/arenaStore';
import { useBuildStore }        from '../../build/stores/buildStore';
import type { Build }           from '../../../api/builds';

interface HamburgerBuildsPanelProps {
  badgeStatus: 'visitor' | 'loyal' | 'king';
  onClose:     () => void;   // closes HamburgerMenu after edit
}

export function HamburgerBuildsPanel({ badgeStatus, onClose }: HamburgerBuildsPanelProps) {
  const { setMode } = useArenaStore();

  const { savedBuilds, setSavedBuilds, removeSavedBuild } = useBuildStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  const canSave = badgeStatus === 'loyal' || badgeStatus === 'king';

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await listMyBuilds();
      setSavedBuilds(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (savedBuilds === null) load();
  }, [savedBuilds]);

  const handleEditing = () => {
    setMode('build');
    onClose();
  };

  const handleDeleted = (buildId: string) => {
    removeSavedBuild(buildId);          // ← publish removal via store
  };

  // ── Visitor gate ─────────────────────────────────────────────────────────
  if (!canSave) {
    return (
      <div className="liquid-glass rounded-xl p-4">
        <p className="font-mono text-[11px] text-white/40 text-center leading-relaxed">
          Sign up as a Loyal member<br />to save and load builds.
        </p>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="font-mono text-[10px] text-white/30 animate-pulse">
          Loading builds…
        </span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="liquid-glass rounded-xl p-4 flex flex-col gap-2">
        <p className="font-mono text-[11px] text-white/40 text-center">
          Failed to load builds.
        </p>
        <button
          onClick={load}
          className="font-mono text-[10px] text-white/40 hover:text-white/70
                     transition-colors mx-auto"
        >
          ↺ Retry
        </button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  const list = savedBuilds ?? [];
  if (list.length === 0) {
    return (
      <div className="liquid-glass rounded-xl p-4">
        <p className="font-mono text-[11px] text-white/30 text-center leading-relaxed">
          No saved builds yet.<br />
          <span className="text-white/20">
            Equip some gear and hit Save Build.
          </span>
        </p>
      </div>
    );
  }

  // ── Build list ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest px-1">
        My Builds ({list.length})
      </span>
      {list.map(build => (
        <BuildCard
          key={build.build_id}
          build={build}
          onEditing={handleEditing}
          onDeleted={() => handleDeleted(build.build_id)}
        />
      ))}
    </div>
  );
}

export default HamburgerBuildsPanel;