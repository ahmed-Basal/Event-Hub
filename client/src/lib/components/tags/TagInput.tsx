import React, { useState, type KeyboardEvent, type ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme/theme';
import { cleanTag } from '../../UTlity/tagUtils';
import { Tag } from './Tag';

export interface TagInputProps {
  /** Currently selected tags */
  value?: string[];
  /** Default tags for uncontrolled usage */
  defaultValue?: string[];
  /** Change callback when tags are added or removed */
  onChange?: (tags: string[]) => void;
  /** Section title/label */
  label?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Suggested tags for quick one-click toggle */
  suggestions?: readonly string[] | string[];
  /** Maximum number of tags allowed */
  maxTags?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Custom error message */
  error?: string;
  /** Custom helper text */
  helperText?: string;
  /** Custom MUI sx overrides for the whole container */
  sx?: SxProps<Theme>;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  defaultValue = [],
  onChange,
  label = 'Topics & Tech Stack Tags',
  placeholder = 'e.g. Docker, GraphQL, Redis...',
  suggestions = [],
  maxTags = 12,
  disabled = false,
  error,
  helperText,
  sx,
}) => {
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const [inputVal, setInputVal] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  const tags = value !== undefined ? value : internalTags;

  const updateTags = (newTags: string[]) => {
    if (value === undefined) {
      setInternalTags(newTags);
    }
    onChange?.(newTags);
  };

  const handleAddTag = (rawTag: string) => {
    setInputError(null);
    const clean = cleanTag(rawTag);
    if (!clean) return;

    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setInputError(`"${clean}" is already added.`);
      return;
    }

    if (tags.length >= maxTags) {
      setInputError(`Maximum limit of ${maxTags} tags reached.`);
      return;
    }

    updateTags([...tags, clean]);
    setInputVal('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setInputError(null);
    updateTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleClearAll = () => {
    setInputError(null);
    updateTags([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      // Remove last tag when user presses backspace in an empty input field
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputError) setInputError(null);
    setInputVal(e.target.value);
  };

  const handleSuggestionToggle = (suggested: string) => {
    const isSelected = tags.includes(suggested);
    if (isSelected) {
      handleRemoveTag(suggested);
    } else {
      handleAddTag(suggested);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      backgroundColor: tokens.surface2,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '& fieldset': {
        borderColor: inputError || error ? '#EF4444' : tokens.border,
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: inputError || error ? '#EF4444' : tokens.borderHover,
      },
      '&.Mui-focused fieldset': {
        borderColor: inputError || error ? '#EF4444' : tokens.primary,
        borderWidth: '1.5px',
      },
    },
    '& .MuiInputLabel-root': {
      color: tokens.textMuted,
      '&.Mui-focused': {
        color: inputError || error ? '#EF4444' : tokens.primary,
      },
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ...sx }}>
      {/* Header with Title and Count Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferIcon sx={{ fontSize: 18, color: tokens.primary }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
            {label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: tokens.textMuted, fontWeight: 600 }}>
            {tags.length} / {maxTags} tags
          </Typography>
          {tags.length > 0 && !disabled && (
            <Button
              size="small"
              onClick={handleClearAll}
              startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                p: 0,
                minWidth: 'auto',
                fontSize: '0.72rem',
                color: tokens.textMuted,
                textTransform: 'none',
                '&:hover': {
                  color: '#EF4444',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Input Field and Add Button */}
      <Box sx={{ display: 'flex', gap: 1.2 }}>
        <TextField
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || tags.length >= maxTags}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: tokens.textMuted,
                      fontSize: '0.9rem',
                    }}
                  >
                    #
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          sx={fieldSx}
        />
        <Button
          type="button"
          variant="outlined"
          onClick={() => handleAddTag(inputVal)}
          disabled={disabled || !inputVal.trim() || tags.length >= maxTags}
          startIcon={<AddRoundedIcon />}
          sx={{
            borderRadius: '14px',
            px: 2.5,
            borderColor: tokens.border,
            color: tokens.primary,
            whiteSpace: 'nowrap',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              borderColor: tokens.primary,
              bgcolor: `${tokens.primary}12`,
            },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Error or validation message */}
      {(inputError || error || helperText) && (
        <Typography
          variant="caption"
          sx={{
            color: inputError || error ? '#EF4444' : tokens.textMuted,
            fontSize: '0.75rem',
            mt: -0.5,
          }}
        >
          {inputError || error || helperText}
        </Typography>
      )}

      {/* Selected Tags Container */}
      {tags.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            p: 1.5,
            borderRadius: '14px',
            bgcolor: tokens.surface3,
            border: `1px solid ${tokens.border}`,
            minHeight: 48,
            alignItems: 'center',
          }}
        >
          {tags.map((tag, idx) => (
            <Tag
              key={tag}
              tag={tag}
              index={idx}
              size="medium"
              onDelete={disabled ? undefined : () => handleRemoveTag(tag)}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            p: 1.5,
            borderRadius: '14px',
            border: `1px dashed ${tokens.border}`,
            bgcolor: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          <Typography variant="caption" sx={{ color: tokens.textMuted, display: 'block' }}>
            No tags added yet. Choose from recommended topics below or type custom tags above.
          </Typography>
        </Box>
      )}

      {/* Suggested Quick-Pick Tags */}
      {suggestions.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: tokens.textMuted,
              display: 'block',
              mb: 1,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Suggested Topics:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {suggestions.map((recTag) => {
              const isSelected = tags.includes(recTag);
              return (
                <Chip
                  key={recTag}
                  label={recTag}
                  size="small"
                  clickable={!disabled}
                  onClick={() => handleSuggestionToggle(recTag)}
                  icon={
                    isSelected ? (
                      <CheckRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit' }} />
                    ) : undefined
                  }
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: isSelected ? `${tokens.primary}22` : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? tokens.primary : tokens.textSecondary,
                    border: `1px solid ${
                      isSelected ? `${tokens.primary}60` : tokens.border
                    }`,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isSelected
                        ? `${tokens.primary}33`
                        : 'rgba(255, 255, 255, 0.08)',
                      borderColor: tokens.primary,
                      transform: 'translateY(-1px)',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};
