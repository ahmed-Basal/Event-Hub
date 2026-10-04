import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { NavLink } from 'react-router';
import { tokens } from '../../theme';

const QUICK_LINKS = [
  { label: 'Explore Events', to: '/activities' },
];

const SOCIALS = [
  { icon: <GitHubIcon sx={{ fontSize: 20 }} />, href: '#', label: 'GitHub' },
  { icon: <LinkedInIcon sx={{ fontSize: 20 }} />, href: '#', label: 'LinkedIn' },
  { icon: <TwitterIcon sx={{ fontSize: 20 }} />, href: '#', label: 'Twitter' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: tokens.surface,
        borderTop: `1px solid ${tokens.border}`,
        mt: 'auto',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${tokens.primary}, transparent)`,
        },
      }}
    >
      <Container maxWidth="xl">
        
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 5, md: 8 },
            py: { xs: 5, md: 7 },
            justifyContent: 'space-between',
          }}
        >
          
          <Box sx={{ maxWidth: 340 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.8 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '12px',
                  bgcolor: tokens.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  color: tokens.bg,
                  fontFamily: 'monospace',
                  boxShadow: tokens.shadowGold,
                }}
              >
                {'</>'}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: tokens.textPrimary, letterSpacing: '-0.01em' }}>
                لمه مبرمجين
              </Typography>
            </Box>
            <Typography
              sx={{ fontSize: '0.85rem', color: tokens.textSecondary, lineHeight: 1.7 }}
            >
              The premier hub for Egypt's tech and developer community. Connect with engineers, attend tech meetups, and level up your skills.
            </Typography>

            
            <Box sx={{ display: 'flex', gap: 1.2, mt: 2.5 }}>
              {SOCIALS.map((s) => (
                <IconButton
                  key={s.label}
                  component="a"
                  href={s.href}
                  target="_blank"
                  aria-label={s.label}
                  size="small"
                  sx={{
                    bgcolor: tokens.surface2,
                    border: `1px solid ${tokens.border}`,
                    color: tokens.textSecondary,
                    width: 38,
                    height: 38,
                    '&:hover': {
                      bgcolor: `${tokens.primary}20`,
                      color: tokens.primary,
                      borderColor: tokens.primary,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: tokens.textPrimary, mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
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
                    transition: 'color 0.2s',
                    '&:hover': { color: tokens.primary },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>

          
          <Box sx={{ maxWidth: 340 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: tokens.textPrimary, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Newsletter
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, mb: 2, lineHeight: 1.5 }}>
              Subscribe to stay updated with upcoming hackathons and events in Egypt.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.2 }}>
              <TextField
                placeholder="Enter your email"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-input': { fontSize: '0.85rem' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: tokens.surface2,
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ flexShrink: 0, px: 2.5, borderRadius: '12px' }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider />

        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            py: 3,
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', color: tokens.textMuted }}>
            © 2026 لمه مبرمجين — All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: tokens.textMuted }}>
            Crafted with ❤️ in Egypt 🇪🇬
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
