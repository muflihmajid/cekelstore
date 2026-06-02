import type { ThemeKey, ThemePreset } from '../domain/entities';

export const themePresets: ThemePreset[] = [
  { key: 'blue-teal', label: 'Blue Teal', description: 'Tema utama Cekel Store, sejuk dan profesional.', primary: '#0D7188', primaryDark: '#06263F', accent: '#16B8C6', surface: '#E6F7F5' },
  { key: 'aqua-soft', label: 'Aqua Soft', description: 'Lebih cerah dan ramah untuk toko harian.', primary: '#0EA5A3', primaryDark: '#075B63', accent: '#37D6C6', surface: '#EBFFFB' },
  { key: 'ocean-blue', label: 'Ocean Blue', description: 'Lebih tenang untuk brand yang ingin terlihat rapi.', primary: '#0A6CA8', primaryDark: '#073B64', accent: '#38BDF8', surface: '#EAF7FF' },
  { key: 'warm-clay', label: 'Warm Clay', description: 'Hangat untuk makanan, hampers, dan usaha rumahan.', primary: '#B86B2B', primaryDark: '#5C3518', accent: '#F4A62A', surface: '#FFF4E6' },
  { key: 'slate-premium', label: 'Slate Premium', description: 'Netral, clean, dan sedikit premium.', primary: '#334155', primaryDark: '#0F172A', accent: '#14B8A6', surface: '#F1F5F9' },
];

export function getTheme(key: ThemeKey | string | null | undefined): ThemePreset {
  return themePresets.find((theme) => theme.key === key) || themePresets[0];
}

export function applyThemeVars(key: ThemeKey | string | null | undefined) {
  const theme = getTheme(key);
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-dark', theme.primaryDark);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-surface-tint', theme.surface);
}
