import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';
import { tokens } from '../../../../theme';
import { config } from '../../../../config';

const PHONE_NUMBER = config.contact.phone;
const WHATSAPP_URL = config.contact.whatsappUrl;
const TEL_URL = config.contact.phoneTel;

export default function FooterContact() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubscribed(true);
    toast.success('Thank you for subscribing to Egypt Developer Community! 🚀');
    setEmail('');
  };

  return (
    <Box>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.88rem',
          color: tokens.textPrimary,
          mb: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Contact & Support
      </Typography>

      {/* Direct Contact Card with Phone: 01016659869 */}
      <Box
        sx={{
          p: 2,
          borderRadius: '16px',
          bgcolor: tokens.surface2,
          border: `1px solid ${tokens.border}`,
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
        }}
      >
        {/* Phone Item */}
        <Box
          component="a"
          href={TEL_URL}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: tokens.textPrimary,
            transition: 'color 0.2s',
            '&:hover': { color: tokens.primary },
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: 'rgba(238, 155, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.primary,
            }}
          >
            <PhoneIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: tokens.textMuted, fontWeight: 600 }}>
              Direct Support / Call
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace' }}>
              {PHONE_NUMBER}
            </Typography>
          </Box>
        </Box>

        {/* WhatsApp Quick Chat */}
        <Box
          component="a"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: tokens.textPrimary,
            transition: 'color 0.2s',
            '&:hover': { color: '#25D366' },
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: 'rgba(37, 211, 102, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#25D366',
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: tokens.textMuted, fontWeight: 600 }}>
              WhatsApp Community
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
              Chat on WhatsApp
            </Typography>
          </Box>
        </Box>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.textMuted,
            }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }}>
            Cairo & Alexandria, Egypt
          </Typography>
        </Box>
      </Box>

      {/* Newsletter Subscription */}
      <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, mb: 1.2 }}>
        Stay updated with the latest community meetups:
      </Typography>
      <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="developer@example.com"
          size="small"
          fullWidth
          disabled={isSubscribed}
          slotProps={{
            input: {
              startAdornment: <EmailOutlinedIcon sx={{ color: tokens.textMuted, fontSize: 18, mr: 1 }} />,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: tokens.surface2,
              fontSize: '0.82rem',
              '& fieldset': { borderColor: tokens.border },
              '&:hover fieldset': { borderColor: tokens.borderHover },
              '&.Mui-focused fieldset': { borderColor: tokens.primary },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubscribed}
          sx={{
            bgcolor: isSubscribed ? '#10B981' : tokens.primary,
            color: tokens.bg,
            fontWeight: 700,
            fontSize: '0.8rem',
            borderRadius: '12px',
            px: 2.2,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: isSubscribed ? '#10B981' : '#e08e0a' },
          }}
        >
          {isSubscribed ? <CheckCircleIcon fontSize="small" /> : 'Join'}
        </Button>
      </Box>
    </Box>
  );
}
