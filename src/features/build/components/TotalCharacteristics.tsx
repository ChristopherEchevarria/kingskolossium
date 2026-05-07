/***
Path: /kingskolossium/src/features/build/components/TotalCharacteristics.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Transparent shell that arranges the 5 TOTALS island cards
  using CSS container queries + CSS order. Each subcomponent mounts exactly once.
  No background — each subcomponent is its own liquid-glass island.
  Wrapper divs use h-full so grid rows stretch cards to equal height per row.

  Layout breakpoints (container width):
    < 420px   — 1 column: stacked in STAT_GROUPS order
    420–699px — 2 columns:
                col-1: Primary, Secondary
                col-2: Combat, Elemental, SecondaryDamage
    ≥ 700px   — 3 columns:
                col-1: Secondary
                col-2: Combat, Primary
                col-3: Elemental, SecondaryDamage
***/

import { CombatStats }          from './totals/CombatStats';
import { PrimaryStats }         from './totals/PrimaryStats';
import { SecondaryStats }       from './totals/SecondaryStats';
import { ElementalStats }       from './totals/ElementalStats';
import { SecondaryDamageStats } from './totals/SecondaryDamageStats';

export function TotalCharacteristics() {
  return (
    <>
      <style>{`
        .totals-ctr {
          container-type: inline-size;
          container-name: totals;
        }

        .totals-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* wrapper divs fill their grid cell height */
        .totals-combat,
        .totals-primary,
        .totals-secondary,
        .totals-elemental,
        .totals-secondarydamage {
          height: 100%;
        }

        /* inner cards fill the wrapper */
        .totals-combat          > *,
        .totals-primary         > *,
        .totals-secondary       > *,
        .totals-elemental       > *,
        .totals-secondarydamage > * {
          height: 100%;
        }

        /* ── 2-col @ 420px ───────────────────────────────── */
        @container totals (min-width: 420px) {
          .totals-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: auto;
            align-items: stretch;
            gap: 0.5rem;
          }
          .totals-combat          { order: 3; }
          .totals-primary         { order: 1; }
          .totals-secondary       { order: 2; }
          .totals-elemental       { order: 4; }
          .totals-secondarydamage { order: 5; }
        }

        /* ── 3-col @ 700px ───────────────────────────────── */
        @container totals (min-width: 700px) {
          .totals-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
          .totals-combat          { order: 2; }
          .totals-primary         { order: 3; }
          .totals-secondary       { order: 1; }
          .totals-elemental       { order: 4; }
          .totals-secondarydamage { order: 5; }
        }
      `}</style>

      <div className="totals-ctr">
        <div className="totals-grid">
          <div className="totals-combat">          <CombatStats />          </div>
          <div className="totals-primary">         <PrimaryStats />         </div>
          <div className="totals-secondary">       <SecondaryStats />       </div>
          <div className="totals-elemental">       <ElementalStats />       </div>
          <div className="totals-secondarydamage"> <SecondaryDamageStats /> </div>
        </div>
      </div>
    </>
  );
}

export default TotalCharacteristics;