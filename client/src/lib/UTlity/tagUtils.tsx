import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../theme/theme';

export interface TagPalette {
  text: string;
  gradient: string;
  glow: string;
}

export const TAG_PALETTES: TagPalette[] = [
  { text: '#38BDF8', gradient: 'linear-gradient(135deg, #0284C7, #38BDF8)', glow: 'rgba(56, 189, 248, 0.35)' },
  { text: '#C084FC', gradient: 'linear-gradient(135deg, #7C3AED, #C084FC)', glow: 'rgba(192, 132, 252, 0.35)' },
  { text: '#34D399', gradient: 'linear-gradient(135deg, #059669, #34D399)', glow: 'rgba(52, 211, 153, 0.35)' },
  { text: '#F472B6', gradient: 'linear-gradient(135deg, #DB2777, #F472B6)', glow: 'rgba(244, 114, 182, 0.35)' },
  { text: '#FBBF24', gradient: 'linear-gradient(135deg, #D97706, #FBBF24)', glow: 'rgba(251, 191, 36, 0.35)' },
  { text: '#818CF8', gradient: 'linear-gradient(135deg, #4F46E5, #818CF8)', glow: 'rgba(129, 140, 248, 0.35)' },
];

/**
 * Returns a deterministic gradient palette for any tag string.
 */
export function getTagPalette(tag: string, index: number = 0): TagPalette {
  let hash = index;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return TAG_PALETTES[hash % TAG_PALETTES.length];
}

interface GradientTagProps {
  tag: string;
  index?: number;
  fontSize?: string | number;
  onDelete?: () => void;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * Reusable developer tag component with gradient borders and monospace typography.
 */
export function GradientTag({
  tag,
  index = 0,
  fontSize = '0.73rem',
  onDelete,
  onClick,
  sx,
}: GradientTagProps) {
  const palette = getTagPalette(tag, index);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.1,
        py: 0.35,
        borderRadius: '7px',
        fontSize,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
        fontWeight: 600,
        letterSpacing: '-0.01em',
        color: palette.text,
        background: `linear-gradient(${tokens.surface}, ${tokens.surface}) padding-box, ${palette.gradient} border-box`,
        border: '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        '&:hover': {
          transform: 'translateY(-2px)',
          background: `linear-gradient(${tokens.surface2}, ${tokens.surface2}) padding-box, ${palette.gradient} border-box`,
          boxShadow: `0 4px 14px ${palette.glow}`,
          color: '#FFFFFF',
          '& .tag-hash': {
            transform: 'scale(1.15)',
          },
        },
        ...sx,
      }}
    >
      <Box
        component="span"
        className="tag-hash"
        sx={{
          fontWeight: 700,
          fontSize: '0.75rem',
          display: 'inline-block',
          transition: 'transform 0.2s ease',
          background: palette.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        #
      </Box>
      <span>{tag}</span>

      {onDelete && (
        <Box
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            ml: 0.5,
            cursor: 'pointer',
            opacity: 0.6,
            fontSize: '0.85rem',
            lineHeight: 1,
            transition: 'opacity 0.15s, transform 0.15s',
            '&:hover': {
              opacity: 1,
              transform: 'scale(1.2)',
              color: '#EF4444',
            },
          }}
        >
          ×
        </Box>
      )}
    </Box>
  );
}
