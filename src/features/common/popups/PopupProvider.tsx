// src/features/common/popups/PopupProvider.tsx
import { createPortal } from 'react-dom';
import { usePopupStore } from './popupStore';
import { SwapPopup } from './SwapPopup';
// import { AnnouncementPopup } from './AnnouncementPopup';  ← future
// import { PaymentPopup }      from './PaymentPopup';       ← future
// import { ConfirmPopup }      from './ConfirmPopup';       ← future

export function PopupProvider() {
  const { stack } = usePopupStore();

  if (stack.length === 0) return null;

  const popups = stack.map((config) => {
    switch (config.id) {
      case 'swap':
        return <SwapPopup key="swap" payload={config.payload} />;
      // case 'announcement':
      //   return <AnnouncementPopup key="announcement" payload={config.payload} />;
      // case 'payment':
      //   return <PaymentPopup key="payment" payload={config.payload} />;
      // case 'confirm':
      //   return <ConfirmPopup key="confirm" payload={config.payload} />;
      default:
        return null;
    }
  });

  // createPortal renders into document.body — completely outside React's
  // component tree, free from every CSS stacking context and overflow clip.
  return createPortal(
    <div style={{ zIndex: 9998, position: 'relative' }}>
      {popups}
    </div>,
    document.body
  );
}

export default PopupProvider;