import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { NavLink } from 'react-router';
import { tokens } from '../../../../theme';

const QUICK_LINKS = [
  { label: 'Explore Events', to: '/activities' },
  { label: 'Create Meetup', to: '/createActivity' },
  { label: 'Sign In', to: '/login' },
  { label: 'Join Community', to: '/register' },
];

const COMMUNITY_TOPICS = [
  '.NET & C# Ecosystem',
  'React & Frontend Architecture',
  'Cloud Native & DevOps',
  'Cybersecurity & Identity',
  'AI & Data Engineering',
];

export default function FooterLinks() {
  return (
    <>
      {/* Column 2: Navigation Links */}
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.88rem',
            color: tokens.textPrimary,
            mb: 2.2,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Navigation
        </Typography>
        <Stack spacing={1.4}>
          {QUICK_LINKS.map((link) => (
            <Typography
              key={link.to}
              component={NavLink}
              to={link.to}
              sx={{
                fontSize: '0.875rem',
                color: tokens.textSecondary,
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  color: tokens.primary,
                  transform: 'translateX(4px)',
                },
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Stack>
      </Box>

      {/* Column 3: Focus Areas */}
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.88rem',
            color: tokens.textPrimary,
            mb: 2.2,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Focus Areas
        </Typography>
        <Stack spacing={1.4}>
          {COMMUNITY_TOPICS.map((topic) => (
            <Typography
              key={topic}
              sx={{
                fontSize: '0.85rem',
                color: tokens.textMuted,
                fontWeight: 500,
              }}
            >
              • {topic}
            </Typography>
          ))}
        </Stack>
      </Box>
    </>
  );
}
