/***
Path:/kingskolossium/src/features/header/components/BadgeStrip.tsx
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: 3-badge row — active state driven by BadgeStatus rank
***/

import visitorBadge  from '../../../assets/header/visitor_badge.png';
import loyalBadge    from '../../../assets/header/loyal_badge.png';
import kingBadge     from '../../../assets/header/king_badge.png';
import inactiveBadge from '../../../assets/header/innactive_badge.png';
import type { BadgeStatus } from '../stores/headerStore';

const BADGES = [
  { key: 'visitor', active: visitorBadge, label: 'Visitor' },
  { key: 'loyal',   active: loyalBadge,   label: 'Loyal'   },
  { key: 'king',    active: kingBadge,    label: 'King'     },
] as const;

const RANK: Record<BadgeStatus, number> = { visitor: 0, loyal: 1, king: 2 };

interface BadgeStripProps {
  status: BadgeStatus;
}

export function BadgeStrip({ status }: BadgeStripProps) {
  return (
    <div className="flex items-center gap-1">
      {BADGES.map((b, i) => {
        const isActive = i <= RANK[status];
        return (
          <img
            key={b.key}
            src={isActive ? b.active : inactiveBadge}
            alt={b.label}
            title={b.label}
            className={`badge-img${isActive ? '' : ' badge-img--inactive'}`}
          />
        );
      })}
    </div>
  );
}

export default BadgeStrip;