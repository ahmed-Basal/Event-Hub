import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import { tokens } from '../../../theme';
import { FooterBrand, FooterLinks, FooterContact, FooterBottom } from '../components/footer';

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
          width: '70%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${tokens.primary}, ${tokens.accent}, transparent)`,
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Main Footer Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1fr 1.8fr',
            },
            gap: { xs: 4, md: 5 },
            py: { xs: 6, md: 8 },
          }}
        >
          {/* Column 1: Brand & Socials */}
          <FooterBrand />

          {/* Columns 2 & 3: Navigation & Focus Topics */}
          <FooterLinks />

          {/* Column 4: Hotline 01016659869, WhatsApp & Newsletter */}
          <FooterContact />
        </Box>

        <Divider sx={{ borderColor: tokens.border }} />

        {/* Bottom Bar: Copyright & Support Chip */}
        <FooterBottom />
      </Container>
    </Box>
  );
}
