import { useController, type UseControllerProps, type FieldValues } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { tokens } from '../../../theme';
import type { SelectOption } from '../../types';

export type SelectInputItem = string | SelectOption | { text: string; value: string };

export type SelectInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<TextFieldProps, 'name' | 'defaultValue'> & {
    label: string;
    items: readonly SelectInputItem[] | SelectInputItem[];
  };

export default function SelectInput<T extends FieldValues>({
  items,
  ...props
}: SelectInputProps<T>) {
  const { field, fieldState } = useController({ ...props, defaultValue: ('' as any) });

  return (
    <TextField
      {...props}
      {...field}
      select
      value={field.value ?? ''}
      fullWidth
      variant="outlined"
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message}
      slotProps={{
        select: {
          MenuProps: {
            slotProps: {
              paper: {
                sx: {
                  bgcolor: tokens.surface2,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: '12px',
                  boxShadow: tokens.shadowDropdown,
                  '& .MuiMenuItem-root': {
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    mx: 0.5,
                    my: 0.25,
                    '&.Mui-selected': {
                      bgcolor: `${tokens.primary}20`,
                      color: tokens.primary,
                      fontWeight: 600,
                    },
                    '&:hover': {
                      bgcolor: `${tokens.primary}12`,
                    },
                  },
                },
              },
            },
          },
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
        ...props.sx,
      }}
    >
      {items.map((item) => {
        let value = '';
        let text = '';
        if (typeof item === 'string') {
          value = item;
          text = item;
        } else if ('label' in item) {
          value = item.value;
          text = item.label;
        } else if ('text' in item) {
          value = item.value;
          text = item.text;
        }
        return (
          <MenuItem key={value} value={value}>
            {text}
          </MenuItem>
        );
      })}
    </TextField>
  );
}
