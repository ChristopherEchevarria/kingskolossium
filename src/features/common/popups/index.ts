// src/features/common/popups/index.ts

export { PopupProvider }  from './PopupProvider';
export { usePopupStore }  from './popupStore';
export { BreedSelectorPopup }  from './BreedSelectorPopup';
export type { PopupId, PopupConfig, SwapPayload, BreedSelectorPayload } from './types';

// Future exports — uncomment as popups are built:
// export { AnnouncementPopup } from './AnnouncementPopup';
// export { PaymentPopup }      from './PaymentPopup';
// export { ConfirmPopup }      from './ConfirmPopup';
// export { ShareBuildPopup }   from './ShareBuildPopup';