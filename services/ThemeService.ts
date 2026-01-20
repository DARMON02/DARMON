
const THEME_KEY = "app:theme";

export type Theme = 'light' | 'dark';

export const ThemeService = {
  getTheme: (): Theme => {
    const stored = localStorage.getItem(THEME_KEY) as Theme;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  init: () => {
    const theme = ThemeService.getTheme();
    ThemeService.setTheme(theme);
  }
};
