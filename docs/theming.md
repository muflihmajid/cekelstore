# Theming

Cekel Storefront uses CSS variables so storefronts can be styled without changing component code.

## Presets

Available presets:

- `fresh`
- `market`
- `mono`

```ts
const store = {
  name: 'Warung Segar',
  whatsappNumber: '081234567890',
  themeId: 'market',
};
```

## CSS Variables

Override variables in your app stylesheet:

```css
:root {
  --cekel-color-primary: #0f766e;
  --cekel-color-primary-contrast: #ffffff;
  --cekel-color-surface: #ffffff;
  --cekel-color-muted: #f4f7f6;
  --cekel-color-text: #17201f;
  --cekel-color-subtle: #66706e;
  --cekel-color-border: #dfe7e5;
  --cekel-radius: 8px;
}
```

Use `themePresetToStyle(themeId)` when you want to apply a preset to your own wrapper element.
