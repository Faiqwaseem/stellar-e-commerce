import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  ring: string;
}

export interface ThemeTypography {
  fontSans: string;
  fontDisplay: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  darkColors: ThemeColors;
  typography: ThemeTypography;
  isPreset?: boolean;
}

const defaultColors: ThemeColors = {
  background: '0 0% 99%',
  foreground: '222 47% 11%',
  card: '0 0% 100%',
  cardForeground: '222 47% 11%',
  primary: '18 92% 55%',
  primaryForeground: '0 0% 100%',
  secondary: '224 71% 14%',
  secondaryForeground: '210 40% 96%',
  muted: '220 14% 96%',
  mutedForeground: '215 16% 47%',
  accent: '43 96% 56%',
  accentForeground: '222 47% 11%',
  destructive: '0 84% 60%',
  border: '220 13% 91%',
  ring: '18 92% 55%',
};

const defaultDarkColors: ThemeColors = {
  background: '224 71% 4%',
  foreground: '210 40% 98%',
  card: '224 50% 8%',
  cardForeground: '210 40% 98%',
  primary: '18 92% 55%',
  primaryForeground: '0 0% 100%',
  secondary: '224 40% 16%',
  secondaryForeground: '210 40% 96%',
  muted: '224 30% 14%',
  mutedForeground: '215 16% 57%',
  accent: '43 96% 56%',
  accentForeground: '222 47% 11%',
  destructive: '0 62% 50%',
  border: '224 30% 16%',
  ring: '18 92% 55%',
};

export const presetThemes: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Coral Flame (Default)',
    colors: defaultColors,
    darkColors: defaultDarkColors,
    typography: { fontSans: "'Plus Jakarta Sans'", fontDisplay: "'Space Grotesk'" },
    isPreset: true,
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    colors: {
      ...defaultColors,
      primary: '210 100% 50%',
      primaryForeground: '0 0% 100%',
      accent: '185 80% 45%',
      accentForeground: '0 0% 100%',
      secondary: '220 60% 12%',
      ring: '210 100% 50%',
    },
    darkColors: {
      ...defaultDarkColors,
      primary: '210 100% 55%',
      accent: '185 80% 50%',
      secondary: '220 50% 14%',
      ring: '210 100% 55%',
    },
    typography: { fontSans: "'Inter'", fontDisplay: "'Outfit'" },
    isPreset: true,
  },
  {
    id: 'emerald-nature',
    name: 'Emerald Nature',
    colors: {
      ...defaultColors,
      primary: '152 69% 40%',
      primaryForeground: '0 0% 100%',
      accent: '84 60% 50%',
      accentForeground: '0 0% 10%',
      secondary: '160 40% 12%',
      ring: '152 69% 40%',
    },
    darkColors: {
      ...defaultDarkColors,
      primary: '152 69% 45%',
      accent: '84 60% 55%',
      secondary: '160 30% 14%',
      ring: '152 69% 45%',
    },
    typography: { fontSans: "'DM Sans'", fontDisplay: "'Playfair Display'" },
    isPreset: true,
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    colors: {
      ...defaultColors,
      primary: '270 70% 55%',
      primaryForeground: '0 0% 100%',
      accent: '320 70% 55%',
      accentForeground: '0 0% 100%',
      secondary: '260 50% 14%',
      ring: '270 70% 55%',
    },
    darkColors: {
      ...defaultDarkColors,
      primary: '270 70% 60%',
      accent: '320 70% 60%',
      secondary: '260 40% 14%',
      ring: '270 70% 60%',
    },
    typography: { fontSans: "'Poppins'", fontDisplay: "'Sora'" },
    isPreset: true,
  },
  {
    id: 'sunset-gold',
    name: 'Sunset Gold',
    colors: {
      ...defaultColors,
      primary: '35 95% 52%',
      primaryForeground: '0 0% 10%',
      accent: '15 85% 55%',
      accentForeground: '0 0% 100%',
      secondary: '30 50% 12%',
      ring: '35 95% 52%',
    },
    darkColors: {
      ...defaultDarkColors,
      primary: '35 95% 55%',
      accent: '15 85% 58%',
      secondary: '30 40% 12%',
      ring: '35 95% 55%',
    },
    typography: { fontSans: "'Nunito Sans'", fontDisplay: "'Raleway'" },
    isPreset: true,
  },
  {
    id: 'midnight-luxury',
    name: 'Midnight Luxury',
    colors: {
      background: '0 0% 98%',
      foreground: '0 0% 8%',
      card: '0 0% 100%',
      cardForeground: '0 0% 8%',
      primary: '0 0% 12%',
      primaryForeground: '0 0% 98%',
      secondary: '0 0% 94%',
      secondaryForeground: '0 0% 12%',
      muted: '0 0% 96%',
      mutedForeground: '0 0% 45%',
      accent: '45 90% 52%',
      accentForeground: '0 0% 8%',
      destructive: '0 84% 60%',
      border: '0 0% 90%',
      ring: '0 0% 12%',
    },
    darkColors: {
      background: '0 0% 5%',
      foreground: '0 0% 95%',
      card: '0 0% 8%',
      cardForeground: '0 0% 95%',
      primary: '0 0% 95%',
      primaryForeground: '0 0% 8%',
      secondary: '0 0% 14%',
      secondaryForeground: '0 0% 90%',
      muted: '0 0% 12%',
      mutedForeground: '0 0% 55%',
      accent: '45 90% 55%',
      accentForeground: '0 0% 8%',
      destructive: '0 62% 50%',
      border: '0 0% 16%',
      ring: '0 0% 95%',
    },
    typography: { fontSans: "'Inter'", fontDisplay: "'Cormorant Garamond'" },
    isPreset: true,
  },
  {
    id: 'neon-electric',
    name: 'Neon Electric',
    colors: {
      ...defaultColors,
      primary: '165 100% 46%',
      primaryForeground: '0 0% 5%',
      accent: '280 100% 65%',
      accentForeground: '0 0% 100%',
      secondary: '240 50% 10%',
      ring: '165 100% 46%',
    },
    darkColors: {
      background: '240 50% 4%',
      foreground: '0 0% 95%',
      card: '240 45% 8%',
      cardForeground: '0 0% 95%',
      primary: '165 100% 50%',
      primaryForeground: '0 0% 5%',
      secondary: '240 40% 14%',
      secondaryForeground: '0 0% 90%',
      muted: '240 30% 12%',
      mutedForeground: '0 0% 55%',
      accent: '280 100% 68%',
      accentForeground: '0 0% 100%',
      destructive: '0 62% 50%',
      border: '240 30% 16%',
      ring: '165 100% 50%',
    },
    typography: { fontSans: "'Space Grotesk'", fontDisplay: "'Orbitron'" },
    isPreset: true,
  },
];

interface ThemeStore {
  activeThemeId: string;
  customThemes: ThemeConfig[];
  getActiveTheme: () => ThemeConfig;
  setActiveTheme: (id: string) => void;
  saveCustomTheme: (theme: ThemeConfig) => void;
  deleteCustomTheme: (id: string) => void;
  updateCustomTheme: (id: string, updates: Partial<ThemeConfig>) => void;
  getAllThemes: () => ThemeConfig[];
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      activeThemeId: 'default',
      customThemes: [],
      getActiveTheme: () => {
        const { activeThemeId, customThemes } = get();
        return [...presetThemes, ...customThemes].find(t => t.id === activeThemeId) || presetThemes[0];
      },
      setActiveTheme: (id) => set({ activeThemeId: id }),
      saveCustomTheme: (theme) => set(state => ({
        customThemes: [...state.customThemes, theme],
      })),
      deleteCustomTheme: (id) => set(state => ({
        customThemes: state.customThemes.filter(t => t.id !== id),
        activeThemeId: state.activeThemeId === id ? 'default' : state.activeThemeId,
      })),
      updateCustomTheme: (id, updates) => set(state => ({
        customThemes: state.customThemes.map(t => t.id === id ? { ...t, ...updates } : t),
      })),
      getAllThemes: () => {
        const { customThemes } = get();
        return [...presetThemes, ...customThemes];
      },
    }),
    { name: 'theme-store' }
  )
);

// Apply theme CSS variables to the document
export function applyTheme(theme: ThemeConfig, isDark: boolean) {
  const root = document.documentElement;
  const colors = isDark ? theme.darkColors : theme.colors;

  const colorMap: Record<string, keyof ThemeColors> = {
    '--background': 'background',
    '--foreground': 'foreground',
    '--card': 'card',
    '--card-foreground': 'cardForeground',
    '--primary': 'primary',
    '--primary-foreground': 'primaryForeground',
    '--secondary': 'secondary',
    '--secondary-foreground': 'secondaryForeground',
    '--muted': 'muted',
    '--muted-foreground': 'mutedForeground',
    '--accent': 'accent',
    '--accent-foreground': 'accentForeground',
    '--destructive': 'destructive',
    '--border': 'border',
    '--input': 'border',
    '--ring': 'ring',
  };

  Object.entries(colorMap).forEach(([cssVar, key]) => {
    root.style.setProperty(cssVar, colors[key]);
  });

  // Apply typography
  root.style.setProperty('--font-sans', `${theme.typography.fontSans}, system-ui, sans-serif`);
  root.style.setProperty('--font-display', `${theme.typography.fontDisplay}, ${theme.typography.fontSans}, system-ui, sans-serif`);

  // Load Google Fonts dynamically
  const fontsToLoad = [theme.typography.fontSans, theme.typography.fontDisplay]
    .map(f => f.replace(/'/g, ''))
    .filter(f => !['system-ui', 'sans-serif'].includes(f));

  const existingLink = document.getElementById('theme-fonts');
  if (existingLink) existingLink.remove();

  if (fontsToLoad.length > 0) {
    const link = document.createElement('link');
    link.id = 'theme-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&')}&display=swap`;
    document.head.appendChild(link);
  }
}
