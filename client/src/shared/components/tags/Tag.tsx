import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme/theme';
import { getTagPalette, type TagPalette } from '../../utils/tagUtils';

import type { TagSize, TagVariant } from '../../types';
export type { TagSize, TagVariant };

export interface TagProps {
  /** The text string of the tag */
  tag: string;
  /** Index for deterministic color palette hashing */
  index?: number;
  /** Size variant */
  size?: TagSize;
  /** Visual variant */
  variant?: TagVariant;
  /** Explicit font-size override for backward-compatibility */
  fontSize?: string | number;
  /** Custom leading symbol/icon; pass null to hide */
  leadingSymbol?: React.ReactNode;
  /** Callback fired when the remove/delete icon is clicked */
  onDelete?: () => void;
  /** Click handler for the tag */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom MUI sx overrides */
  sx?: SxProps<Theme>;
  /** Optional class name */
  className?: string;
}

const SIZE_CONFIGS: Record<
  TagSize,
  {
    px: number;
    py: number;
    fontSize: string;
    hashSize: string;
    gap: number;
    radius: string;
    deleteIconSize: number;
  }
> = {
  small: {
    px: 0.9,
    py: 0.25,
    fontSize: '0.72rem',
    hashSize: '0.72rem',
    gap: 0.4,
    radius: '6px',
    deleteIconSize: 12,
  },
  medium: {
    px: 1.1,
    py: 0.35,
    fontSize: '0.8rem',
    hashSize: '0.8rem',
    gap: 0.5,
    radius: '8px',
    deleteIconSize: 14,
  },
  large: {
    px: 1.4,
    py: 0.5,
    fontSize: '0.88rem',
    hashSize: '0.88rem',
    gap: 0.6,
    radius: '10px',
    deleteIconSize: 16,
  },
};

/**
 * Reusable developer tag component with gradient borders, monospace typography,
 * and high-contrast dark theme aesthetics.
 */
export const Tag: React.FC<TagProps> = ({
  tag,
  index = 0,
  size = 'small',
  variant = 'gradient',
  fontSize,
  leadingSymbol,
  onDelete,
  onClick,
  disabled = false,
  sx,
  className,
}) => {
  const palette: TagPalette = getTagPalette(tag, index);
  const cfg = SIZE_CONFIGS[size];
  const isClickable = Boolean(onClick) && !disabled;
  const isDeletable = Boolean(onDelete) && !disabled;

  // Base background & border logic depending on variant
  let backgroundStyle: string;
  let borderStyle: string;
  let textColor: string = palette.text;

  if (variant === 'gradient') {
    backgroundStyle = `linear-gradient(${tokens.surface}, ${tokens.surface}) padding-box, ${palette.gradient} border-box`;
    borderStyle = '1px solid transparent';
  } else if (variant === 'subtle') {
    backgroundStyle = palette.bgSubtle;
    borderStyle = `1px solid ${palette.borderSubtle}`;
  } else {
    // outline
    backgroundStyle = 'transparent';
    borderStyle = `1px solid ${palette.borderSubtle}`;
  }

  return (
    <Box
      component="span"
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
              }
            }
          : undefined
      }
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: cfg.gap,
        px: cfg.px,
        py: cfg.py,
        borderRadius: cfg.radius,
        fontSize: fontSize ?? cfg.fontSize,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
        fontWeight: 600,
        letterSpacing: '-0.01em',
        color: textColor,
        background: backgroundStyle,
        border: borderStyle,
        cursor: isClickable ? 'pointer' : 'default',
        userSelect: 'none',
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: variant === 'gradient' ? '0 2px 6px rgba(0,0,0,0.25)' : 'none',
        '&:hover': isClickable || isDeletable ? {
          transform: 'translateY(-1.5px)',
          background:
            variant === 'gradient'
              ? `linear-gradient(${tokens.surface2}, ${tokens.surface2}) padding-box, ${palette.gradient} border-box`
              : variant === 'subtle'
              ? `${palette.bgSubtle}`
              : 'rgba(255, 255, 255, 0.05)',
          boxShadow: `0 4px 14px ${palette.glow}`,
          color: '#FFFFFF',
          borderColor: variant !== 'gradient' ? palette.text : 'transparent',
          '& .tag-leading-symbol': {
            transform: 'scale(1.15)',
          },
        } : {},
        ...sx,
      }}
    >
      {/* Leading hashtag or custom symbol */}
      {leadingSymbol !== null && (
        <Box
          component="span"
          className="tag-leading-symbol"
          sx={{
            fontWeight: 700,
            fontSize: cfg.hashSize,
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            background: palette.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {leadingSymbol ?? '#'}
        </Box>
      )}

      {/* Tag Text */}
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
        {tag}
      </Box>

      {/* Delete / Remove Action Button */}
      {isDeletable && (
        <IconButton
          component="span"
          size="small"
          aria-label={`Remove tag ${tag}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          sx={{
            p: 0.2,
            ml: 0.25,
            color: tokens.textMuted,
            borderRadius: '4px',
            lineHeight: 0,
            transition: 'color 0.15s, background-color 0.15s, transform 0.15s',
            '&:hover': {
              color: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              transform: 'scale(1.15)',
            },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: cfg.deleteIconSize }} />
        </IconButton>
      )}
    </Box>
  );
};

// Default export
export default Tag;
