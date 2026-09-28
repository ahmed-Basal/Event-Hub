export type TagSize = 'small' | 'medium' | 'large';
export type TagVariant = 'gradient' | 'subtle' | 'outline';

export interface TagPalette {
  text: string;
  gradient: string;
  glow: string;
  bgSubtle: string;
  borderSubtle: string;
}

export interface TagItem {
  id?: string;
  name: string;
  count?: number;
}
