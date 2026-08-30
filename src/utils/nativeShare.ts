import { Share } from '@capacitor/share';

export const shareQuestionOrScore = async (title: string, text: string, url?: string) => {
  try {
    await Share.share({
      title,
      text,
      url: url || 'https://edupluscreation.github.io/ENGLISHPRO/',
      dialogTitle: 'Share with SSC Study Groups',
    });
    return true;
  } catch {
    // Fallback to Web Share API or Clipboard
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch {
        return false;
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${title}\n${text}`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};
