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

  const handleForbidden = () => {
    agent.get('/buggy/forbidden').catch(err => console.log(err.response ?? err));
  };

  const handleBadId = () => {
    agent.get('/buggy/bad-guid/notaguid').catch(err => console.log(err.response ?? err));
  };

  const handleValidationError = () => {
    setValidationErrors([]);
    agent.post('/buggy/validation-error', {})
      .catch(err => {
        if (Array.isArray(err)) {
          setValidationErrors(err);
        } else {
          console.log(err);
        }
      });
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
        Error Diagnostics & Test Suite
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Test and verify end-to-end exception and HTTP status code handling across frontend and backend.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="contained" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={handleNotFound} color="primary">Not Found (404)</Button>
          <Button onClick={handleBadRequest} color="warning">Bad Request (400)</Button>
          <Button onClick={handleValidationError} color="info">Validation Error (400)</Button>
          <Button onClick={handleServerError} color="error">Server Error (500)</Button>
          <Button onClick={handleUnauthorized} color="secondary">Unauthorized (401)</Button>
          <Button onClick={handleForbidden} color="warning">Forbidden (403)</Button>
          <Button onClick={handleBadId} color="inherit">Bad Guid / Id</Button>
        </ButtonGroup>
      </Box>

      {validationErrors && validationErrors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f87171' }}>
              Validation Errors Received:
            </Typography>
            <Button size="small" onClick={() => setValidationErrors([])} sx={{ textTransform: 'none' }}>
              Clear Errors
            </Button>
          </Box>
          <ValidationError errors={validationErrors} />
        </Box>
      )}
    </Container>
  );
}
