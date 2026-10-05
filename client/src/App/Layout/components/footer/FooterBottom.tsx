import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PhoneIcon from '@mui/icons-material/Phone';
import { tokens } from '../../../../theme';

const PHONE_NUMBER = '01016659869';
const TEL_URL = 'tel:+201016659869';

export default function FooterBottom() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: '0.82rem', color: tokens.textMuted }}>
          © 2026 لمه مبرمجين (DevMeet Egypt). All rights reserved.
        </Typography>
        <Chip
          label={`Support: ${PHONE_NUMBER}`}
          size="small"
          component="a"
          href={TEL_URL}
          clickable
          icon={<PhoneIcon sx={{ fontSize: '13px !important' }} />}
          sx={{
            bgcolor: 'rgba(238, 155, 0, 0.1)',
            color: tokens.primary,
            border: `1px solid rgba(238, 155, 0, 0.25)`,
            fontWeight: 700,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'rgba(238, 155, 0, 0.2)',
              borderColor: tokens.primary,
            },
          }}
        />
      </Box>

      <Typography sx={{ fontSize: '0.82rem', color: tokens.textMuted }}>
        Crafted with ❤️ for Egyptian Software Engineers 🇪🇬
      </Typography>
    </Box>
  );
}
