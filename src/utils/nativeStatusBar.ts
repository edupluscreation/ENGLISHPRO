import { StatusBar, Style } from '@capacitor/status-bar';

export const syncNativeStatusBar = async (isDarkMode: boolean) => {
  try {
    if (isDarkMode) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch {
    // Ignore in standard web browser
  }
};
