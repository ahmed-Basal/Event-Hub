import { useState, type KeyboardEvent } from 'react';
import { useController, type UseControllerProps, type FieldValues } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { TagList } from '../../../../shared';
import { tokens } from '../../../../theme';

import type { SxProps, Theme } from '@mui/material/styles';

export interface TagInputProps<T extends FieldValues> extends UseControllerProps<T> {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export default function TagInput<T extends FieldValues>({
  label,
  placeholder = 'Add topic tag (e.g. React, Docker, .NET) and press Enter',
  ...props
}: TagInputProps<T>) {
  const { field, fieldState } = useController({ ...props, defaultValue: ([] as any) });
  const [inputValue, setInputValue] = useState('');

  const currentTags: string[] = Array.isArray(field.value) ? field.value : [];

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!currentTags.includes(trimmed)) {
      field.onChange([...currentTags, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = (_tag: string, index: number) => {
    const updated = currentTags.filter((_, idx) => idx !== index);
    field.onChange(updated);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
        variant="outlined"
        error={Boolean(fieldState.error)}
        helperText={fieldState.error?.message}
        slotProps={{
          input: {
            endAdornment: (
              <IconButton
                onClick={handleAddTag}
                disabled={!inputValue.trim()}
                sx={{
                  color: inputValue.trim() ? tokens.primary : tokens.textMuted,
                  p: 0.5,
                  '&:hover': { color: tokens.primary },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '& fieldset': {
              borderColor: tokens.border,
            },
            '&:hover fieldset': {
              borderColor: tokens.borderHover,
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: tokens.textSecondary,
            '&.Mui-focused': {
              color: tokens.primary,
            },
          },
        }}
      />

      {currentTags.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <TagList
            tags={currentTags}
            variant="subtle"
            size="medium"
            onTagDelete={handleDeleteTag}
          />
        </Box>
      )}

      {currentTags.length === 0 && (
        <Typography variant="caption" sx={{ color: tokens.textMuted, mt: 0.5, display: 'block', pl: 1 }}>
          No tags added yet. Enter a topic and press Enter to categorize your meetup.
        </Typography>
      )}
    </Box>
  );
}
