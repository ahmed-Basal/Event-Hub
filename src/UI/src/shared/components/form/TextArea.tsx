import { useController, type UseControllerProps, type FieldValues } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { tokens } from '../../../theme';

export interface TextAreaProps<T extends FieldValues>
  extends UseControllerProps<T>,
    Omit<TextFieldProps, 'name' | 'defaultValue'> {
  label: string;
  rows?: number;
}

export default function TextArea<T extends FieldValues>({ rows = 4, ...props }: TextAreaProps<T>) {
  const { field, fieldState } = useController({ ...props, defaultValue: ('' as any) });

  return (
    <TextField
      {...props}
      {...field}
      value={field.value ?? ''}
      multiline
      rows={rows}
      fullWidth
      variant="outlined"
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
