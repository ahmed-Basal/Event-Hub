import { type FieldValues } from 'react-hook-form';
import TextInput, { type TextInputProps } from './TextInput';

export type TextAreaProps<T extends FieldValues = FieldValues> = TextInputProps<T> & {
  rows?: number;
};

export function TextArea<T extends FieldValues = FieldValues>({
  rows = 4,
  sx,
  ...props
}: TextAreaProps<T>) {
  return (
    <TextInput<T>
      multiline
      rows={rows}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '16px',
        },
        ...sx,
      }}
      {...props}
    />
  );
}

export default TextArea;
