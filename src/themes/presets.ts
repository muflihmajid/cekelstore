export interface ThemePreset {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export const themePresets: ThemePreset[] = [
  {
    id: 'fresh',
    name: 'Fresh',
    variables: {
      '--cekel-color-primary': '#0f766e',
      '--cekel-color-primary-contrast': '#ffffff',
      '--cekel-color-surface': '#ffffff',
      '--cekel-color-muted': '#f4f7f6',
      '--cekel-color-text': '#17201f',
      '--cekel-color-subtle': '#66706e',
      '--cekel-color-border': '#dfe7e5',
      '--cekel-radius': '8px',
    },
  },
  {
    id: 'market',
    name: 'Market',
    variables: {
      '--cekel-color-primary': '#b45309',
      '--cekel-color-primary-contrast': '#ffffff',
      '--cekel-color-surface': '#ffffff',
      '--cekel-color-muted': '#f8f3ec',
      '--cekel-color-text': '#231b14',
      '--cekel-color-subtle': '#786b5e',
      '--cekel-color-border': '#eadfce',
      '--cekel-radius': '6px',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    variables: {
      '--cekel-color-primary': '#111827',
      '--cekel-color-primary-contrast': '#ffffff',
      '--cekel-color-surface': '#ffffff',
      '--cekel-color-muted': '#f3f4f6',
      '--cekel-color-text': '#111827',
      '--cekel-color-subtle': '#6b7280',
      '--cekel-color-border': '#e5e7eb',
      '--cekel-radius': '4px',
    },
  },
];

export function getThemePreset(themeId?: string): ThemePreset {
  return themePresets.find((theme) => theme.id === themeId) ?? themePresets[0];
}

export function themePresetToStyle(themeId?: string): Record<string, string> {
  return getThemePreset(themeId).variables;
}
