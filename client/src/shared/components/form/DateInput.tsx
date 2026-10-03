import { useController, type UseControllerProps, type FieldValues } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { tokens } from '../../../theme';

export type DateInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<TextFieldProps, 'name' | 'defaultValue'> & {
    label: string;
  };

export default function DateInput<T extends FieldValues>(props: DateInputProps<T>) {
  const { field, fieldState } = useController({ ...props, defaultValue: ('' as any) });

  const formatValueForInput = (val: unknown): string => {
    if (!val) return '';
    if (typeof val === 'string') {
      if (val.length >= 16 && val.includes('T')) {
        return val.slice(0, 16);
      }
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        }
      } catch {
        return val;
      }
    }
    if (val instanceof Date && !isNaN(val.getTime())) {
      return new Date(val.getTime() - val.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    return '';
  };

  return (
    <TextField
      {...props}
      {...field}
      type="datetime-local"
      value={formatValueForInput(field.value)}
      onChange={(e) => field.onChange(e.target.value)}
      fullWidth
      variant="outlined"
      slotProps={{
        inputLabel: {
          shrink: true,
        },
      }}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message}
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
          '& input::-webkit-calendar-picker-indicator': {
            filter: 'invert(0.8)',
            cursor: 'pointer',
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
    />
  );
}
