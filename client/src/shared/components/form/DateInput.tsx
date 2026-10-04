import { useController, type UseControllerProps, type FieldValues } from 'react-hook-form';
import { DateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme';

export interface DateInputProps<T extends FieldValues> extends UseControllerProps<T> {
  label: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  slotProps?: DateTimePickerProps['slotProps'];
}

export default function DateInput<T extends FieldValues>({
  label,
  disabled,
  sx,
  slotProps,
  ...controllerProps
}: DateInputProps<T>) {
  const { field, fieldState } = useController({
    ...controllerProps,
    defaultValue: ('' as any),
  });

  const parseDateValue = (val: unknown): Date | null => {
    if (!val) return null;
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val;
    }
    if (typeof val === 'string') {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const parsedValue = parseDateValue(field.value);

  return (
    <DateTimePicker
      label={label}
      value={parsedValue}
      disabled={disabled}
      closeOnSelect={false}
      onChange={(newValue) => {
        if (!newValue || isNaN(newValue.getTime())) {
          field.onChange('');
        } else {
          field.onChange(newValue.toISOString());
        }
      }}
      slotProps={{
        actionBar: {
          actions: ['clear', 'accept'],
          sx: {
            p: 1.5,
            pt: 0.5,
            '& .MuiButton-root': {
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              px: 2,
            },
          },
        },
        textField: {
          fullWidth: true,
          variant: 'outlined',
          error: Boolean(fieldState.error),
          helperText: fieldState.error?.message,
          onBlur: field.onBlur,
          sx: {
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
              '& .MuiIconButton-root': {
                color: tokens.textSecondary,
                '&:hover': {
                  color: tokens.primary,
                },
              },
            },
            '& .MuiInputLabel-root': {
              color: tokens.textSecondary,
              '&.Mui-focused': {
                color: tokens.primary,
              },
            },
            ...sx,
          },
        },
        popper: {
          sx: {
            '& .MuiPaper-root': {
              borderRadius: '16px',
              border: `1px solid ${tokens.border}`,
              bgcolor: tokens.surface,
              backgroundImage: 'none',
              boxShadow: tokens.shadowDropdown,
              '& .MuiPickersDay-root.Mui-selected': {
                bgcolor: tokens.primary,
                color: '#000',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: tokens.primary,
                },
              },
              '& .MuiClock-pin, & .MuiClockPointer-root': {
                bgcolor: tokens.primary,
              },
              '& .MuiClockPointer-thumb': {
                borderColor: tokens.primary,
                bgcolor: tokens.primary,
              },
            },
          },
        },
        ...slotProps,
      }}
    />
  );
}
