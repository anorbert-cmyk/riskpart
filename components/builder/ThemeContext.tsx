import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Theme Definitions ──────────────────────────────────────────────
// Inspired by award-winning financial dashboard designs

export interface DashboardTheme {
  id: string;
  name: string;
  description: string;
  inspiration: string;
  tokens: ThemeTokens;
}

export interface ThemeTokens {
  // Backgrounds
  bgPrimary: string;
  bgSurface: string;
  bgSurface2: string;
  bgHeader: string;
  bgWidget: string;
  bgWidgetHeader: string;
  bgHover: string;
  bgInput: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Accent
  accent: string;
  accentHover: string;
  accentMuted: string;

  // Borders
  border: string;
  borderLight: string;
  borderFocus: string;

  // Status colors
  positive: string;
  negative: string;
  warning: string;
  info: string;

  // Decorative
  radius: string;
  radiusLg: string;
  shadow: string;
  shadowLg: string;

  // Typography
  fontHeading: string;
  fontBody: string;
  fontMono: string;
}

// ─── Theme 1: FEY (Dark Cinematic) ─────────────────────────────────
// Inspired by Fey app — pure black, orange-red accent, Inter font
const feyTheme: DashboardTheme = {
  id: 'fey',
  name: 'Fey Dark',
  description: 'Cinematic dark mode with orange accents',
  inspiration: 'Fey App',
  tokens: {
    bgPrimary: '#000000',
    bgSurface: '#0A0A0A',
    bgSurface2: '#151515',
    bgHeader: '#0A0A0A',
    bgWidget: '#0F0F0F',
    bgWidgetHeader: '#141414',
    bgHover: '#1A1A1A',
    bgInput: '#0F0F0F',
    textPrimary: '#F0F0F0',
    textSecondary: '#888888',
    textMuted: '#555555',
    textInverse: '#000000',
    accent: '#FF3D00',
    accentHover: '#FF5722',
    accentMuted: 'rgba(255,61,0,0.15)',
    border: '#1F1F1F',
    borderLight: '#141414',
    borderFocus: '#FF3D00',
    positive: '#00E676',
    negative: '#FF1744',
    warning: '#FFAB00',
    info: '#448AFF',
    radius: '8px',
    radiusLg: '12px',
    shadow: '0 1px 3px rgba(0,0,0,0.4)',
    shadowLg: '0 8px 32px rgba(0,0,0,0.6)',
    fontHeading: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontMono: "'JetBrains Mono', 'SF Mono', monospace",
  },
};

// ─── Theme 2: BLOOMBERG (Terminal Dense) ────────────────────────────
// Inspired by Bloomberg Terminal — dark navy, blue/amber accents, data-dense
const bloombergTheme: DashboardTheme = {
  id: 'bloomberg',
  name: 'Terminal',
  description: 'Dense data-first terminal aesthetic',
  inspiration: 'Bloomberg Terminal',
  tokens: {
    bgPrimary: '#0C1117',
    bgSurface: '#111820',
    bgSurface2: '#171F28',
    bgHeader: '#0C1117',
    bgWidget: '#111820',
    bgWidgetHeader: '#0E161E',
    bgHover: '#1A2332',
    bgInput: '#0C1117',
    textPrimary: '#E8ECF0',
    textSecondary: '#7A8A9E',
    textMuted: '#4A5A6E',
    textInverse: '#0C1117',
    accent: '#FF8F00',
    accentHover: '#FFA726',
    accentMuted: 'rgba(255,143,0,0.12)',
    border: '#1E2A38',
    borderLight: '#172230',
    borderFocus: '#2196F3',
    positive: '#26A69A',
    negative: '#EF5350',
    warning: '#FF8F00',
    info: '#42A5F5',
    radius: '2px',
    radiusLg: '4px',
    shadow: '0 1px 2px rgba(0,0,0,0.3)',
    shadowLg: '0 4px 16px rgba(0,0,0,0.5)',
    fontHeading: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontMono: "'JetBrains Mono', 'SF Mono', monospace",
  },
};

// ─── Theme 3: STRIPE (Clean Minimal) ────────────────────────────────
// Inspired by Stripe Dashboard — white, purple accent, generous spacing
const stripeTheme: DashboardTheme = {
  id: 'stripe',
  name: 'Clean Light',
  description: 'Minimal light theme with purple accents',
  inspiration: 'Stripe Dashboard',
  tokens: {
    bgPrimary: '#F6F8FA',
    bgSurface: '#FFFFFF',
    bgSurface2: '#F0F2F5',
    bgHeader: '#FFFFFF',
    bgWidget: '#FFFFFF',
    bgWidgetHeader: '#FAFBFC',
    bgHover: '#F0F2F5',
    bgInput: '#FFFFFF',
    textPrimary: '#1A1F36',
    textSecondary: '#5E6687',
    textMuted: '#9CA3BC',
    textInverse: '#FFFFFF',
    accent: '#635BFF',
    accentHover: '#7A73FF',
    accentMuted: 'rgba(99,91,255,0.08)',
    border: '#E3E8EE',
    borderLight: '#F0F2F5',
    borderFocus: '#635BFF',
    positive: '#0CAF60',
    negative: '#E25C5C',
    warning: '#E89F29',
    info: '#4B8BF5',
    radius: '8px',
    radiusLg: '12px',
    shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    shadowLg: '0 10px 40px rgba(0,0,0,0.08)',
    fontHeading: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontMono: "'JetBrains Mono', 'SF Mono', monospace",
  },
};

// ─── Theme 4: WEALTHSIMPLE (Editorial Warm) ────────────────────────
// Inspired by Wealthsimple — warm off-white, serif headings, earthy tones
const wealthsimpleTheme: DashboardTheme = {
  id: 'wealthsimple',
  name: 'Editorial',
  description: 'Warm editorial style with serif typography',
  inspiration: 'Wealthsimple',
  tokens: {
    bgPrimary: '#FAFAF8',
    bgSurface: '#FFFFFF',
    bgSurface2: '#F5F3EF',
    bgHeader: 'rgba(255,255,255,0.95)',
    bgWidget: '#FFFFFF',
    bgWidgetHeader: '#FAF9F7',
    bgHover: '#F5F3EF',
    bgInput: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textMuted: '#A0A0A0',
    textInverse: '#FFFFFF',
    accent: '#1A1A1A',
    accentHover: '#333333',
    accentMuted: 'rgba(26,26,26,0.06)',
    border: 'rgba(0,0,0,0.06)',
    borderLight: 'rgba(0,0,0,0.03)',
    borderFocus: '#1A1A1A',
    positive: '#16A34A',
    negative: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
    radius: '2px',
    radiusLg: '4px',
    shadow: '0 1px 3px rgba(0,0,0,0.04)',
    shadowLg: '0 8px 40px -12px rgba(0,0,0,0.12)',
    fontHeading: "'Georgia', 'Times New Roman', serif",
    fontBody: "system-ui, sans-serif",
    fontMono: "'SF Mono', 'Monaco', 'Inconsolata', monospace",
  },
};

// ─── Exports ────────────────────────────────────────────────────────
export const THEMES: DashboardTheme[] = [feyTheme, bloombergTheme, stripeTheme, wealthsimpleTheme];

interface ThemeContextType {
  theme: DashboardTheme;
  setTheme: (id: string) => void;
  themes: DashboardTheme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTheme, setActiveTheme] = useState<DashboardTheme>(wealthsimpleTheme);

  const setTheme = useCallback((id: string) => {
    const found = THEMES.find((t) => t.id === id);
    if (found) setActiveTheme(found);
  }, []);

  // Apply CSS custom properties to document root
  const t = activeTheme.tokens;
  const style: Record<string, string> = {
    '--theme-bg': t.bgPrimary,
    '--theme-surface': t.bgSurface,
    '--theme-surface2': t.bgSurface2,
    '--theme-header': t.bgHeader,
    '--theme-widget': t.bgWidget,
    '--theme-widget-header': t.bgWidgetHeader,
    '--theme-hover': t.bgHover,
    '--theme-input': t.bgInput,
    '--theme-text': t.textPrimary,
    '--theme-text2': t.textSecondary,
    '--theme-text3': t.textMuted,
    '--theme-text-inv': t.textInverse,
    '--theme-accent': t.accent,
    '--theme-accent-hover': t.accentHover,
    '--theme-accent-muted': t.accentMuted,
    '--theme-border': t.border,
    '--theme-border-light': t.borderLight,
    '--theme-border-focus': t.borderFocus,
    '--theme-positive': t.positive,
    '--theme-negative': t.negative,
    '--theme-warning': t.warning,
    '--theme-info': t.info,
    '--theme-radius': t.radius,
    '--theme-radius-lg': t.radiusLg,
    '--theme-shadow': t.shadow,
    '--theme-shadow-lg': t.shadowLg,
  };

  // Generate CSS overrides that remap existing Tailwind classes to theme tokens
  // This means existing widgets with classes like text-charcoal, bg-white, etc.
  // automatically adapt to the theme without code changes
  const cssOverrides = `
    [data-theme] .text-charcoal { color: ${t.textPrimary} !important; }
    [data-theme] .text-charcoal-muted { color: ${t.textSecondary} !important; }
    [data-theme] .text-charcoal-muted\\/60, [data-theme] .text-charcoal-muted\\/50, [data-theme] .text-charcoal-muted\\/40, [data-theme] .text-charcoal-muted\\/30 { color: ${t.textMuted} !important; }
    [data-theme] .text-charcoal\\/30, [data-theme] .text-charcoal\\/40, [data-theme] .text-charcoal\\/20 { color: ${t.textMuted} !important; }
    [data-theme] .text-white { color: ${t.textInverse} !important; }
    [data-theme] .bg-white { background-color: ${t.bgWidget} !important; }
    [data-theme] .bg-off-white { background-color: ${t.bgSurface2} !important; }
    [data-theme] .bg-off-white\\/50 { background-color: ${t.bgWidgetHeader} !important; }
    [data-theme] .bg-\\[\\#FAFAF8\\] { background-color: ${t.bgPrimary} !important; }
    [data-theme] .bg-\\[\\#F5F5F3\\] { background-color: ${t.bgSurface2} !important; }
    [data-theme] .border-border-hairline { border-color: ${t.border} !important; }
    [data-theme] .border-border-hairline\\/50, [data-theme] .border-border-hairline\\/30 { border-color: ${t.borderLight} !important; }
    [data-theme] .border-black\\/\\[0\\.06\\], [data-theme] .border-black\\/\\[0\\.08\\], [data-theme] .border-black\\/\\[0\\.04\\] { border-color: ${t.border} !important; }
    [data-theme] .bg-charcoal { background-color: ${t.accent} !important; }
    [data-theme] .bg-charcoal\\/5, [data-theme] .bg-charcoal\\/\\[0\\.03\\], [data-theme] .bg-charcoal\\/\\[0\\.02\\] { background-color: ${t.accentMuted} !important; }
    [data-theme] .bg-charcoal\\/10 { background-color: ${t.accentMuted} !important; }
    [data-theme] .hover\\:bg-off-white\\/80:hover { background-color: ${t.bgHover} !important; }
    [data-theme] .hover\\:bg-off-white\\/50:hover { background-color: ${t.bgHover} !important; }
    [data-theme] .bg-charcoal\\/70 { background-color: ${t.accent} !important; opacity: 0.7; }
    [data-theme] .font-mono { font-family: ${t.fontMono} !important; }
    [data-theme] .font-serif { font-family: ${t.fontHeading} !important; }
    [data-theme] .hover\\:bg-charcoal\\/5:hover { background-color: ${t.bgHover} !important; }
    [data-theme] .bg-white\\/95 { background-color: ${t.bgHeader} !important; }
  `;

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, setTheme, themes: THEMES }}>
      <style dangerouslySetInnerHTML={{ __html: cssOverrides }} />
      <div style={style as React.CSSProperties} data-theme={activeTheme.id}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
