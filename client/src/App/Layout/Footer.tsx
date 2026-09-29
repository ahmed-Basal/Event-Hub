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
  { label: 'Host an Event', to: '/createActivity' },
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
      }}
    >
      <Container maxWidth="xl">
        {/* Top section */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 4, md: 6 },
            py: { xs: 4, md: 6 },
            justifyContent: 'space-between',
          }}
        >
          {/* Brand column */}
          <Box sx={{ maxWidth: 320 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  bgcolor: tokens.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: tokens.bg,
                  fontFamily: 'monospace',
                }}
              >
                {'</>'}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: tokens.textPrimary }}>
                لمه مبرمجين
              </Typography>
            </Box>
            <Typography
              sx={{ fontSize: '0.82rem', color: tokens.textMuted, lineHeight: 1.65 }}
            >
              The premier hub for Egypt's tech and developer community. Connect with engineers, attend tech meetups, and level up your skills.
            </Typography>

            {/* Social icons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {SOCIALS.map((s) => (
                <IconButton
                  key={s.label}
                  component="a"
                  href={s.href}
                  target="_blank"
                  aria-label={s.label}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${tokens.border}`,
                    color: tokens.textMuted,
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: `${tokens.primary}18`,
                      color: tokens.primary,
                      borderColor: `${tokens.primary}55`,
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: tokens.textPrimary, mb: 1.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {QUICK_LINKS.map((link) => (
                <Typography
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  sx={{
                    fontSize: '0.85rem',
                    color: tokens.textSecondary,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: tokens.primary },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Newsletter */}
          <Box sx={{ maxWidth: 320 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: tokens.textPrimary, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Newsletter
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: tokens.textMuted, mb: 2 }}>
              Subscribe to stay updated with upcoming hackathons and events in Egypt.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Enter your email"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-input': { fontSize: '0.82rem' },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ flexShrink: 0, px: 2 }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Bottom bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            py: 2.5,
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: tokens.textMuted }}>
            © 2026 لمه مبرمجين — All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: tokens.textMuted }}>
            Crafted with ❤️ in Egypt 🇪🇬
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
