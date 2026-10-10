import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { tokens } from '../../../theme';
import { RegisterForm } from '../components/register';

export default function RegisterPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: '24px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(238, 155, 0, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <RegisterForm />
      </Paper>
    </Container>
  );
}
