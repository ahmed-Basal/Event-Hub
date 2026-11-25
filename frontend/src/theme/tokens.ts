export const tokens = {
  bg: '#0A0E1A',
  surface: '#131A2D',
  surface2: '#1C2640',
  surface3: '#253356',
  primary: '#0EA5E9', // Electric Blue / Sky
  primaryHover: '#0284C7',
  primaryLight: '#38BDF8',
  primaryGlow: 'rgba(14, 165, 233, 0.35)',
  accent: '#F43F5E', // Vibrant Rose/Coral (alerts, cancel, badges)
  accentHover: '#E11D48',
  accentGlow: 'rgba(244, 63, 94, 0.35)',
  teal: '#14B8A6', // Neon Teal
  tealHover: '#0D9488',
  tealGlow: 'rgba(20, 184, 166, 0.35)',
  gold: '#F59E0B',
  goldGlow: 'rgba(245, 158, 11, 0.35)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(14, 165, 233, 0.5)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  shadowPrimary: '0px 10px 30px 0px rgba(14, 165, 233, 0.35)',
  shadowCoral: '0px 10px 32px 0px rgba(244, 63, 94, 0.35)',
  shadowTeal: '0px 10px 28px 0px rgba(20, 184, 166, 0.3)',
  shadowCard: '0px 24px 56px -10px rgba(0, 0, 0, 0.6), 0px 0px 1px 1px rgba(14, 165, 233, 0.18)',
  shadowDropdown: '0px 20px 48px rgba(0, 0, 0, 0.75), 0px 0px 1px 1px rgba(255, 255, 255, 0.12)',
} as const;

export type DesignTokens = typeof tokens;
