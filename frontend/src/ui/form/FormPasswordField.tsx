'use client';

import { useState } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { tokens } from '@/theme/tokens';

type FormPasswordFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'type'>;

export default function FormPasswordField<T extends FieldValues>({
  name,
  control,
  helperText,
  slotProps,
  ...rest
}: FormPasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          type={showPassword ? 'text' : 'password'}
          value={field.value ?? ''}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
          fullWidth
          slotProps={{
            ...slotProps,
            input: {
              ...(typeof slotProps?.input === 'object' ? slotProps.input : {}),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    size="small"
                    sx={{ color: tokens.textSecondary }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
