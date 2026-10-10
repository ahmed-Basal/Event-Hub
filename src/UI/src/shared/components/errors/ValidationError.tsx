import { ErrorMessage } from '../..';

export interface ValidationErrorProps {
  errors: string[];
}

export default function ValidationError({ errors }: ValidationErrorProps) {
  return <ErrorMessage error={errors} title="Validation Errors" sx={{ mt: 2 }} />;
}
