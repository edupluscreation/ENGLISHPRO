import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  try {
    const impactMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: impactMap[style] });
  } catch {
    // Fallback or web browser fallback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(style === 'heavy' ? 40 : (style === 'medium' ? 25 : 12));
    }
  }
};

export const triggerSuccessHaptic = async () => {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 20]);
    }
  }
};

export const triggerWarningHaptic = async () => {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 40, 30]);
    }
  }
};
