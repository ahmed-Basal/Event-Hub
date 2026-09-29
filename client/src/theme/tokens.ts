// ============================================================
// Design Tokens — Figma Events Egypt Design Tokens
// ============================================================
export const tokens = {
  bg: '#0B0F19',
  surface: '#161B26',
  surface2: '#1B2230',
  surface3: '#111722',
  primary: '#F59E0B',       // Egyptian Amber Gold
  accent: '#FF4655',        // Sunset Coral
  teal: '#06B6D4',          // Nile Turquoise
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.14)',
  textPrimary: '#F8FAFC',
  textSecondary: '#B8C0CE',
  textMuted: '#7E8899',
  shadowGold: '0px 10px 36px 0px rgba(245, 158, 11, 0.22)',
  shadowCoral: '0px 8px 28px 0px rgba(255, 70, 85, 0.4)',
  shadowCard: '0px 16px 40px 0px rgba(0, 0, 0, 0.32)',
  shadowDropdown: '0px 10px 30px 0px rgba(0, 0, 0, 0.5)',
} as const;

export type DesignTokens = typeof tokens;
