import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme/theme';
import { Tag, type TagProps, type TagSize, type TagVariant } from './Tag';

export interface TagListProps {
  /** Array of tag strings */
  tags?: string[];
  /** Maximum number of tags displayed before collapsing into "+N more" */
  maxVisible?: number;
  /** Size for rendered tags */
  size?: TagSize;
  /** Variant for rendered tags */
  variant?: TagVariant;
  /** Font size override for tags */
  fontSize?: string | number;
  /** Click handler for individual tags */
  onTagClick?: (tag: string, index: number) => void;
  /** Remove handler for individual tags */
  onTagDelete?: (tag: string, index: number) => void;
  /** Fallback message or node when tags array is empty */
  emptyMessage?: React.ReactNode;
  /** Spacing between tags */
  gap?: number | string;
  /** Container custom styles */
  sx?: SxProps<Theme>;
  /** Custom tag styles */
  tagSx?: TagProps['sx'];
}

/**
 * Renders a list of tags with optional overflow collapse (+N badge with tooltip).
 */
export const TagList: React.FC<TagListProps> = ({
  tags = [],
  maxVisible,
  size = 'small',
  variant = 'gradient',
  fontSize,
  onTagClick,
  onTagDelete,
  emptyMessage,
  gap = 0.8,
  sx,
  tagSx,
}) => {
  if (!tags || tags.length === 0) {
    if (!emptyMessage) return null;
    return typeof emptyMessage === 'string' ? (
      <Typography variant="caption" sx={{ color: tokens.textMuted }}>
        {emptyMessage}
      </Typography>
    ) : (
      <>{emptyMessage}</>
    );
  }

  const hasOverflow = typeof maxVisible === 'number' && tags.length > maxVisible;
  const visibleTags = hasOverflow ? tags.slice(0, maxVisible) : tags;
  const overflowTags = hasOverflow ? tags.slice(maxVisible) : [];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap,
        ...sx,
      }}
    >
      {visibleTags.map((tag, idx) => (
        <Tag
          key={`${tag}-${idx}`}
          tag={tag}
          index={idx}
          size={size}
          variant={variant}
          fontSize={fontSize}
          onClick={onTagClick ? () => onTagClick(tag, idx) : undefined}
          onDelete={onTagDelete ? () => onTagDelete(tag, idx) : undefined}
          sx={tagSx}
        />
      ))}

      {hasOverflow && (
        <Tooltip
          arrow
          placement="top"
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: tokens.surface2,
                border: `1px solid ${tokens.borderHover}`,
                borderRadius: '12px',
                p: 1.2,
                boxShadow: tokens.shadowDropdown,
                maxWidth: 280,
              },
            },
            arrow: {
              sx: {
                color: tokens.surface2,
              },
            },
          }}
          title={
            <Box sx={{ p: 0.2 }}>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: tokens.primary,
                  mb: 0.8,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                More Topics ({overflowTags.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {overflowTags.map((t, idx) => (
                  <Tag
                    key={t}
                    tag={t}
                    index={visibleTags.length + idx}
                    size="small"
                    variant={variant}
                    onClick={onTagClick ? () => onTagClick(t, visibleTags.length + idx) : undefined}
                  />
                ))}
              </Box>
            </Box>
          }
        >
          <Chip
            label={`+${overflowTags.length}`}
            size="small"
            sx={{
              height: size === 'small' ? 22 : 26,
              fontSize: size === 'small' ? '0.68rem' : '0.75rem',
              fontWeight: 700,
              bgcolor: tokens.surface2,
              color: tokens.textSecondary,
              border: `1px solid ${tokens.border}`,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: tokens.surface3,
                color: tokens.textPrimary,
                borderColor: tokens.primary,
                boxShadow: `0 0 10px rgba(245, 158, 11, 0.25)`,
              },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};
