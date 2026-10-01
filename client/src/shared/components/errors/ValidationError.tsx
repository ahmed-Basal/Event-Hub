import { ErrorMessage } from '../..';

interface Props {
  errors: string[];
}

export default function ValidationError({ errors }: Props) {
  return <ErrorMessage error={errors} title="Validation Errors" sx={{ mt: 2 }} />;
}
