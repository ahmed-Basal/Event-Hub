'use client';

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import MenuItem from '@mui/material/MenuItem';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

export interface SelectOption {
  label: string;
  value: string;
}

type FormSelectFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: readonly SelectOption[];
} & Omit<TextFieldProps, 'name' | 'select' | 'value' | 'onChange' | 'onBlur' | 'error'>;

export default function FormSelectField<T extends FieldValues>({
  name,
  control,
  options,
  helperText,
  ...rest
}: FormSelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          select
          value={field.value ?? ''}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
          fullWidth
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
