import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { formFieldSx } from './formFieldSx';

export type TextInputProps<T extends FieldValues = FieldValues> = Omit<TextFieldProps, 'name'> & {
  name?: Path<T>;
  control?: Control<T>;
};

export function TextInput<T extends FieldValues = FieldValues>({
  name,
  control,
  sx,
  ...props
}: TextInputProps<T>) {
  if (control && name) {
    return <ControlledTextInput name={name} control={control} sx={sx} {...props} />;
  }

  return (
    <TextField
      fullWidth
      sx={[formFieldSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...props}
    />
  );
}

function ControlledTextInput<T extends FieldValues>({
  name,
  control,
  sx,
  helperText,
  ...props
}: TextInputProps<T> & { name: Path<T>; control: Control<T> }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextField
      {...field}
      value={field.value ?? ''}
      error={Boolean(error)}
      helperText={error?.message ?? helperText}
      fullWidth
      sx={[formFieldSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...props}
    />
  );
}

export default TextInput;
