import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { tokens } from '../../../../theme';

const WHATSAPP_URL = 'https://wa.me/201016659869';

const SOCIALS = [
  { icon: <WhatsAppIcon sx={{ fontSize: 20 }} />, href: WHATSAPP_URL, label: 'WhatsApp' },
  { icon: <GitHubIcon sx={{ fontSize: 20 }} />, href: 'https://github.com', label: 'GitHub' },
  { icon: <LinkedInIcon sx={{ fontSize: 20 }} />, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: <TwitterIcon sx={{ fontSize: 20 }} />, href: 'https://twitter.com', label: 'X (Twitter)' },
];

export default function FooterBrand() {
  return (
    <Box sx={{ maxWidth: 360 }}>
      {/* Brand Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            bgcolor: tokens.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 900,
            color: tokens.bg,
            fontFamily: 'monospace',
            boxShadow: tokens.shadowGold,
          }}
        >
          {'</>'}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.2rem',
              color: tokens.textPrimary,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            لمه مبرمجين
          </Typography>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: tokens.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Egypt Dev Community 🇪🇬
          </Typography>
        </Box>
      </Box>

      {/* Description */}
      <Typography
        sx={{
          fontSize: '0.88rem',
          color: tokens.textSecondary,
          lineHeight: 1.7,
          mb: 3,
        }}
      >
        The premier platform for Egyptian software engineers, architects, and tech enthusiasts.
        Attend hands-on meetups, connect with mentors, and share knowledge across Egypt.
      </Typography>

      {/* Social Media Links */}
      <Stack direction="row" spacing={1.2}>
        {SOCIALS.map((s) => (
          <IconButton
            key={s.label}
            component="a"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            size="small"
            sx={{
              bgcolor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              color: tokens.textSecondary,
              width: 40,
              height: 40,
              borderRadius: '12px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: 'rgba(238, 155, 0, 0.12)',
                color: tokens.primary,
                borderColor: tokens.primary,
                transform: 'translateY(-2px)',
              },
            }}
          >
            {s.icon}
          </IconButton>
        ))}
      </Stack>
    </Box>
  );
}
