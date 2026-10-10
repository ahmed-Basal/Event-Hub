

export const tokens = {
  bg: '#0A0E1A',
  surface: '#131A2D',
  surface2: '#1C2640',
  surface3: '#253356',
  primary: '#6366F1', // Electric Indigo
  primaryGlow: 'rgba(99, 102, 241, 0.35)',
  accent: '#EC4899', // Vibrant Pink/Coral
  accentGlow: 'rgba(236, 72, 153, 0.4)',
  teal: '#14B8A6', // Neon Teal
  tealGlow: 'rgba(20, 184, 166, 0.35)',
  gold: '#F59E0B',
  goldGlow: 'rgba(245, 158, 11, 0.35)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(99, 102, 241, 0.5)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  shadowGold: '0px 12px 40px 0px rgba(245, 158, 11, 0.3)',
  shadowCoral: '0px 10px 32px 0px rgba(236, 72, 153, 0.4)',
  shadowCard: '0px 24px 56px -10px rgba(0, 0, 0, 0.6), 0px 0px 1px 1px rgba(99, 102, 241, 0.15)',
  shadowDropdown: '0px 20px 48px rgba(0, 0, 0, 0.75), 0px 0px 1px 1px rgba(255, 255, 255, 0.12)',
} as const;

export type DesignTokens = typeof tokens;
