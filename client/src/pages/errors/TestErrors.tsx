import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Typography,
} from '@mui/material';
import { agent } from '../../shared';
import ValidationError from '../../shared/components/errors/ValidationError';

export default function TestErrors() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleNotFound = () => {
    agent.get('/buggy/not-found').catch(err => console.log(err.response ?? err));
  };

  const handleBadRequest = () => {
    agent.get('/buggy/bad-request').catch(err => console.log(err.response ?? err));
  };

  const handleServerError = () => {
    agent.get('/buggy/server-error').catch(err => console.log(err.response ?? err));
  };

  const handleUnauthorized = () => {
    agent.get('/buggy/unauthorised').catch(err => console.log(err.response ?? err));
  };

  const handleBadId = () => {
    agent.get('/activities/notaguid').catch(err => console.log(err.response ?? err));
  };

  const handleValidationError = () => {
    setValidationErrors([]);
    agent.post('/activities', {})
      .catch(err => setValidationErrors(err));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Test Errors Component
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="contained" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={handleNotFound}>Not Found (404)</Button>
          <Button onClick={handleBadRequest}>Bad Request (400)</Button>
          <Button onClick={handleValidationError}>Validation Error (400)</Button>
          <Button onClick={handleServerError}>Server Error (500)</Button>
          <Button onClick={handleUnauthorized}>Unauthorized (401)</Button>
          <Button onClick={handleBadId}>Bad Guid / Id</Button>
        </ButtonGroup>
      </Box>

      {validationErrors && validationErrors.length > 0 && (
        <ValidationError errors={validationErrors} />
      )}
    </Container>
  );
}
