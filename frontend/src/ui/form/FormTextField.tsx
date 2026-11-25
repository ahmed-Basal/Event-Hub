'use client';

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

type FormTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error'>;

export default function FormTextField<T extends FieldValues>({
  name,
  control,
  helperText,
  ...rest
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          value={field.value ?? ''}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
          fullWidth
        />
      )}
    />
  );
}
