/***
 * Path: kingskolossium/src/features/build/BuildSharePage.tsx
 * Created by: Christopher Echevarria
 * Date of creation: 14May2026
 * Purpose and Description: Read-only shared build view at /build/:build_id.
 *   Fetches the build on mount, renders EquipmentActiveSlots in display-only mode,
 *   TotalCharacteristics, and ActiveSetsPanel. Loyal+ users can fork the build
 *   into their own BuildPage with a _{username} name suffix.
 ***/

import { useEffect, useState }       from 'react';
import { useParams, useNavigate }    from 'react-router-dom';
import { fetchBuild }                from '../../api/builds';
import { fetchEquipmentDetail }      from '../../api/equipment';
import { useBuildStore }             from './stores/buildStore';
import { useAuthStore }              from '../auth/stores/authStore';
import { useArenaStore }             from '../arena/stores/arenaStore';
import { TotalCharacteristics }      from './components/TotalCharacteristics';
import { ActiveSetsPanel }           from './components/ActiveSetsPanel';
import { EquipmentActiveSlots }      from './components/EquipmentActiveSlots';
import { SLOT_ROWS }                 from './slots';
import type { Build }                from '../../api/builds';
import type { SlotId }               from './slots';

const ALL_SLOTS = SLOT_ROWS.flat() as SlotId[];

export function BuildSharePage() {
  const { build_id }                              = useParams<{ build_id: string }>();
  const navigate                                   = useNavigate();
  const { loadBuild, equipToSlot, setCurrentBuildId, setCurrentBuildName } = useBuildStore();
  const { user }                                   = useAuthStore();
  const { setMode }                                = useArenaStore();

  const [build,     setBuild]     = useState<Build | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (!build_id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchBuild(build_id);
        setBuild(data);

        // Hydrate the store so TotalCharacteristics + ActiveSetsPanel reflect the build
        loadBuild(data);
        const entries = ALL_SLOTS
          .map(slotId => ({ slotId, entry: data.slots[slotId] }))
          .filter((e): e is { slotId: SlotId; entry: { item_id: number; icon_id: number } } =>
            e.entry !== null
          )
          .map(({ slotId, entry }) => ({ slotId, itemId: entry.item_id }));

        await Promise.all(
          entries.map(async ({ slotId, itemId }) => {
            const item = await fetchEquipmentDetail(itemId);
            equipToSlot(item, slotId);
          })
        );
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [build_id]);

  // ── Fork build — load into BuildPage with _{username} suffix ─────────────
  const handleFork = async () => {
    if (!build || !user) return;
    setHydrating(true);
    try {
      loadBuild(build);

      const entries = ALL_SLOTS
        .map(slotId => ({ slotId, itemId: build.slots[slotId] }))
        .filter((e): e is { slotId: SlotId; itemId: number } => e.itemId !== null);

      await Promise.all(
        entries.map(async ({ slotId, itemId }) => {
          const item = await fetchEquipmentDetail(itemId);
          equipToSlot(item, slotId);
        })
      );

      // Unsaved copy — new name, no build_id
      setCurrentBuildName(`${build.name}_${user.nickname}`);
      setCurrentBuildId(null);

      setMode('build');
      navigate('/');
    } finally {
      setHydrating(false);
    }
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-white/30 animate-pulse text-sm">
          Loading build…
        </span>
      </div>
    );
  }

  if (notFound || !build) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-white/40 text-sm">Build not found.</p>
        <button
          onClick={() => navigate('/')}
          className="font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors"
        >
          ← Back to Kolossium
        </button>
      </div>
    );
  }

  const canFork = user?.badge_status === 'loyal' || user?.badge_status === 'king';

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-mono text-lg text-white/80">{build.name}</h1>
          <span className="font-mono text-[10px] text-white/30 border border-white/10
                           rounded px-2 py-0.5 shrink-0 mt-1">
            Lv {build.level}
          </span>
        </div>
        <p className="font-mono text-[11px] text-white/35">
          by {build.nickname}
        </p>
        {build.comment && (
          <p className="font-mono text-[11px] text-white/40 mt-1 leading-relaxed">
            {build.comment}
          </p>
        )}
      </div>

      {/* Read-only slot grid */}
      <div className="pointer-events-none opacity-90">
        <EquipmentActiveSlots />
      </div>

      {/* Stats + Sets */}
      <TotalCharacteristics />
      <ActiveSetsPanel />

      {/* Fork CTA */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-white/[0.06]">
        {canFork ? (
          <button
            onClick={handleFork}
            disabled={hydrating}
            className="font-mono text-[12px] px-4 py-2 rounded-lg
                       bg-white/10 hover:bg-white/15 border border-white/15
                       text-white/70 hover:text-white/90 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hydrating ? 'Loading…' : 'Edit this build →'}
          </button>
        ) : (
          <p className="font-mono text-[10px] text-white/25 text-center">
            Sign up as a Loyal member to edit and save a copy of this build.
          </p>
        )}
        <button
          onClick={() => navigate('/')}
          className="font-mono text-[10px] text-white/25 hover:text-white/50 transition-colors"
        >
          ← Back to Kolossium
        </button>
      </div>

    </div>
  );
}

export default BuildSharePage;