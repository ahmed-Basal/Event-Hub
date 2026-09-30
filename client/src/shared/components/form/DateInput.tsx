import { type FieldValues } from 'react-hook-form';
import TextInput, { type TextInputProps } from './TextInput';

export type DateInputProps<T extends FieldValues = FieldValues> = TextInputProps<T>;

export function DateInput<T extends FieldValues = FieldValues>({
  sx,
  slotProps,
  ...props
}: DateInputProps<T>) {
  return (
    <TextInput<T>
      type="date"
      slotProps={{
        inputLabel: { shrink: true },
        ...slotProps,
      }}
      sx={{
        '& input[type="date"]': {
          colorScheme: 'dark',
        },
        ...sx,
      }}
      {...props}
    />
  );
}

export default DateInput;
