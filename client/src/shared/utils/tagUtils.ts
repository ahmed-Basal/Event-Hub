import type { TagPalette } from '../types';

export type { TagPalette };

export const TAG_PALETTES: TagPalette[] = [
  {
    text: '#38BDF8',
    gradient: 'linear-gradient(135deg, #0284C7, #38BDF8)',
    glow: 'rgba(56, 189, 248, 0.35)',
    bgSubtle: 'rgba(56, 189, 248, 0.08)',
    borderSubtle: 'rgba(56, 189, 248, 0.25)',
  },
  {
    text: '#C084FC',
    gradient: 'linear-gradient(135deg, #7C3AED, #C084FC)',
    glow: 'rgba(192, 132, 252, 0.35)',
    bgSubtle: 'rgba(192, 132, 252, 0.08)',
    borderSubtle: 'rgba(192, 132, 252, 0.25)',
  },
  {
    text: '#34D399',
    gradient: 'linear-gradient(135deg, #059669, #34D399)',
    glow: 'rgba(52, 211, 153, 0.35)',
    bgSubtle: 'rgba(52, 211, 153, 0.08)',
    borderSubtle: 'rgba(52, 211, 153, 0.25)',
  },
  {
    text: '#F472B6',
    gradient: 'linear-gradient(135deg, #DB2777, #F472B6)',
    glow: 'rgba(244, 114, 182, 0.35)',
    bgSubtle: 'rgba(244, 114, 182, 0.08)',
    borderSubtle: 'rgba(244, 114, 182, 0.25)',
  },
  {
    text: '#FBBF24',
    gradient: 'linear-gradient(135deg, #D97706, #FBBF24)',
    glow: 'rgba(251, 191, 36, 0.35)',
    bgSubtle: 'rgba(251, 191, 36, 0.08)',
    borderSubtle: 'rgba(251, 191, 36, 0.25)',
  },
  {
    text: '#818CF8',
    gradient: 'linear-gradient(135deg, #4F46E5, #818CF8)',
    glow: 'rgba(129, 140, 248, 0.35)',
    bgSubtle: 'rgba(129, 140, 248, 0.08)',
    borderSubtle: 'rgba(129, 140, 248, 0.25)',
  },
  {
    text: '#2DD4BF',
    gradient: 'linear-gradient(135deg, #0D9488, #2DD4BF)',
    glow: 'rgba(45, 212, 191, 0.35)',
    bgSubtle: 'rgba(45, 212, 191, 0.08)',
    borderSubtle: 'rgba(45, 212, 191, 0.25)',
  },
  {
    text: '#FB7185',
    gradient: 'linear-gradient(135deg, #E11D48, #FB7185)',
    glow: 'rgba(251, 113, 133, 0.35)',
    bgSubtle: 'rgba(251, 113, 133, 0.08)',
    borderSubtle: 'rgba(251, 113, 133, 0.25)',
  },
];

export function getTagPalette(tag: string, index: number = 0): TagPalette {
  if (!tag) return TAG_PALETTES[0];
  let hash = index;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return TAG_PALETTES[hash % TAG_PALETTES.length];
}

export function cleanTag(rawTag: string): string {
  return rawTag.trim().replace(/^#+/, '').trim();
}

export const POPULAR_TAGS: readonly string[] = [
  '.NET 9',
  'C#',
  'Microservices',
  'React',
  'Clean Architecture',
  'Docker',
  'PostgreSQL',
  'Next.js',
  'Cybersecurity',
  'DevOps',
  'AI / ML',
  'Cloud / Azure',
] as const;
