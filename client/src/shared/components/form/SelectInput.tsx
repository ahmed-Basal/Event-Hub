import MenuItem from '@mui/material/MenuItem';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { formFieldSx } from './formFieldSx';

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectInputProps<T extends FieldValues = FieldValues> = Omit<
  TextFieldProps,
  'name' | 'select'
> & {
  name?: Path<T>;
  control?: Control<T>;
  options: readonly (SelectOption | string)[];
};

export function SelectInput<T extends FieldValues = FieldValues>({
  name,
  control,
  options,
  sx,
  children,
  ...props
}: SelectInputProps<T>) {
  if (control && name) {
    return (
      <ControlledSelectInput
        name={name}
        control={control}
        options={options}
        sx={sx}
        {...props}
      />
    );
  }

  const renderedOptions = options.map((opt) => {
    const value = typeof opt === 'string' ? opt : opt.value;
    const label = typeof opt === 'string' ? opt : opt.label;
    return (
      <MenuItem key={value} value={value}>
        {label}
      </MenuItem>
    );
  });

  return (
    <TextField
      select
      fullWidth
      sx={[formFieldSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...props}
    >
      {children ?? renderedOptions}
    </TextField>
  );
}

function ControlledSelectInput<T extends FieldValues>({
  name,
  control,
  options,
  sx,
  helperText,
  ...props
}: SelectInputProps<T> & { name: Path<T>; control: Control<T> }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextField
      {...field}
      value={field.value ?? ''}
      select
      error={Boolean(error)}
      helperText={error?.message ?? helperText}
      fullWidth
      sx={[formFieldSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...props}
    >
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        );
      })}
    </TextField>
  );
}

export default SelectInput;
