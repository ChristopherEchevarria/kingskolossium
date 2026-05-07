/***
 * Path: /kingskolossium/src/features/common/popups/BreedSelectorPopup.tsx
 * Created by: Christopher Echevarria
 * Date of creation: 07May2026
 * Purpose and Description: Modal popup for selecting a player class (breed) and gender.
 *   Contains three co-located pieces: ClassGrid, ClassButton, and GenderToggle.
 *   On confirm the selected breed_id + gender are written to buildStore and the
 *   popup closes. Clicking the backdrop discards the selection without saving.
 ***/

import { useState } from 'react';
import { useBuildStore }   from '../../build/stores/buildStore';
import type { BreedInfo }  from '../../../api/breeds';
import { usePopupStore }   from './popupStore';
import { API_BASE_URL }    from '../../../api/client';
import type { BreedSelectorPayload } from './types';

// Extract the look ID from a Dofus look string: "{1|10||53}" → "10"
export function parseLookId(look: string | null | undefined): string | null {
  if (!look) return null;
  const match = look.match(/\|(\d+)\|/);
  return match ? match[1] : null;
}

// Build the head image filename from a look string
export function headFilename(look: string | null | undefined): string | null {
  const id = parseLookId(look);
  return id ? `Head_${id}-64.png` : null;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female';

// ── GenderToggle ──────────────────────────────────────────────────────────────

interface GenderToggleProps {
  gender:    Gender;
  onChange:  (g: Gender) => void;
}

function GenderToggle({ gender, onChange }: GenderToggleProps) {
  return (
    <div
      className="flex rounded-lg overflow-hidden border"
      style={{ borderColor: 'rgba(255,255,255,0.10)' }}
    >
      {(['male', 'female'] as Gender[]).map((g) => {
        const active = gender === g;
        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-150"
            style={{
              background: active ? 'rgba(91,124,247,0.25)' : 'rgba(255,255,255,0.03)',
              color:      active ? '#8faaf9'               : 'rgba(255,255,255,0.35)',
              borderRight: g === 'male' ? '1px solid rgba(255,255,255,0.10)' : undefined,
            }}
          >
            {g === 'male' ? '♂ Male' : '♀ Female'}
          </button>
        );
      })}
    </div>
  );
}

// ── ClassButton ───────────────────────────────────────────────────────────────

interface ClassButtonProps {
  breedId:   number;
  headImg:   string;
  selected:  boolean;
  onSelect:  (breedId: number) => void;
}

function ClassButton({ breedId, headImg, selected, onSelect }: ClassButtonProps) {
  return (
    <button
      onClick={() => onSelect(breedId)}
      className="flex flex-col items-center justify-center rounded-lg p-1.5 transition-all duration-150 border group"
      style={{
        aspectRatio:  '1 / 1',
        background:   selected ? 'rgba(91,124,247,0.18)' : 'rgba(255,255,255,0.03)',
        borderColor:  selected ? 'rgba(91,124,247,0.70)' : 'rgba(255,255,255,0.08)',
        boxShadow:    selected ? '0 0 0 1px rgba(91,124,247,0.35)' : 'none',
      }}
    >
      <img
        src={headImg}
        alt={`class-${breedId}`}
        draggable={false}
        className="w-full h-full object-contain transition-all duration-150"
        style={{ opacity: selected ? 1 : 0.55 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
        onMouseLeave={(e) => {
          if (!selected) (e.currentTarget as HTMLImageElement).style.opacity = '0.55';
        }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.15'; }}
      />
    </button>
  );
}

// ── ClassGrid ─────────────────────────────────────────────────────────────────

interface ClassGridProps {
  breeds:     BreedInfo[];   // ← add
  gender:     Gender;
  selectedId: number | null;
  onSelect:   (breedId: number) => void;
}

function ClassGrid({ breeds, gender, selectedId, onSelect }: ClassGridProps) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}>
      {breeds.map((breed) => {
        const look = gender === 'male' ? breed.male_look : breed.female_look;
        const id   = parseLookId(look);
        const src  = id
          ? `${API_BASE_URL}/api/assets/classes/Head_${id}-64.png?size=2x`
          : '';
        return (
          <ClassButton
            key={breed.breed_id}
            breedId={breed.breed_id}
            headImg={src}
            selected={selectedId === breed.breed_id}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

// ── BreedSelectorPopup ────────────────────────────────────────────────────────

interface BreedSelectorPopupProps {
  payload: BreedSelectorPayload;
}

export function BreedSelectorPopup({ payload: _payload }: BreedSelectorPopupProps) {
  const { breedId: storedBreedId, gender: storedGender, setBreed, breeds } = useBuildStore();
  const { closePopup } = usePopupStore();

  // Local state — only written to store on confirm
  const [localBreedId, setLocalBreedId] = useState<number | null>(storedBreedId);
  const [gender, setGender]             = useState<Gender>(storedGender);

  const handleConfirm = () => {
    if (localBreedId !== null) {
      setBreed(localBreedId, gender);
    }
    closePopup('breed-selector');
  };

  // Backdrop click → discard
  const handleBackdropClick = () => closePopup('breed-selector');

  // Stop propagation so clicking inside the modal doesn't close it
  const handlePanelClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────────
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex:     9999,
        background: 'rgba(0,0,0,0.60)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* ── Modal panel ───────────────────────────────────────────────────── */}
      <div
        onClick={handlePanelClick}
        className="liquid-glass rounded-xl flex flex-col gap-4"
        style={{
          width:     'min(520px, 92vw)',
          maxHeight: '90vh',
          padding:   '20px',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-white/50 uppercase tracking-widest">
            Select Class
          </span>
          <button
            onClick={() => closePopup('breed-selector')}
            className="font-mono text-[12px] text-white/25 hover:text-white/70 transition-colors leading-none"
          >
            ✕
          </button>
        </div>

        {/* Gender toggle */}
        <div className="flex justify-center">
          <GenderToggle gender={gender} onChange={setGender} />
        </div>

        {/* Class grid */}
        <ClassGrid
          breeds={breeds.filter(b => b.breed_id !== 19)}
          gender={gender}
          selectedId={localBreedId}
          onSelect={setLocalBreedId}
        />

        {/* Confirm */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleConfirm}
            disabled={localBreedId === null}
            className="font-mono text-[10px] uppercase tracking-widest px-5 py-2 rounded-lg
                       transition-all duration-150 border"
            style={{
              background:  localBreedId !== null ? 'rgba(91,124,247,0.20)' : 'rgba(255,255,255,0.03)',
              borderColor: localBreedId !== null ? 'rgba(91,124,247,0.50)' : 'rgba(255,255,255,0.08)',
              color:       localBreedId !== null ? '#8faaf9'               : 'rgba(255,255,255,0.20)',
              cursor:      localBreedId !== null ? 'pointer'               : 'not-allowed',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default BreedSelectorPopup;