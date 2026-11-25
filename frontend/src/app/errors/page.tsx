'use client';

import { Box, Button, ButtonGroup, Paper, Typography } from '@mui/material';
import { agent } from '@/core/api/client';
import { tokens } from '@/theme/tokens';

export default function TestErrorsPage() {
  const trigger = (path: string) => {
    agent.get(path).catch(() => {});
  };

  return (
    <Paper sx={{ p: 4, borderRadius: '18px' }}>
      <Typography variant="h5" fontWeight={700} color={tokens.primaryLight} mb={3}>
        API Error Diagnostics
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        <ButtonGroup variant="outlined">
          <Button onClick={() => trigger('/buggy/not-found')}>Not Found (404)</Button>
          <Button onClick={() => trigger('/buggy/bad-request')}>Bad Request (400)</Button>
          <Button onClick={() => trigger('/buggy/server-error')}>Server Error (500)</Button>
          <Button onClick={() => trigger('/buggy/unauthorised')}>Unauthorized (401)</Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );
}
