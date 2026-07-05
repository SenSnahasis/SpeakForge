// A handful of chart/SVG spots pass raw hex colors as props instead of
// Tailwind classes, so they can't pick up the CSS-variable-driven theme
// automatically. This is the theme-aware lookup table for those cases.
export const SURFACE_COLORS = {
  dark: { hover: '#1c2438', card: '#161d2e', border: 'rgba(255,255,255,0.08)', axis: '#64748b' },
  light: { hover: '#eef1f7', card: '#ffffff', border: 'rgba(15,23,42,0.08)', axis: '#64748b' },
}

export const STREAK_INTENSITY_COLORS = {
  dark: ['#1c2438', '#1e3a5f', '#1d5c73', '#16897d', '#2dd4bf'],
  light: ['#e7e9ef', '#b9e4de', '#7cd9c9', '#3fceb4', '#2dd4bf'],
}
