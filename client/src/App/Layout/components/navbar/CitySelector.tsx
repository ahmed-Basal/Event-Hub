import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { tokens } from '../../../../theme';

const CITIES = ['Cairo', 'Alexandria', 'Giza', 'El Gouna', 'Dahab', 'Sahel'];

export default function CitySelector() {
  const [city, setCity] = useState('Cairo');
  const [cityAnchor, setCityAnchor] = useState<null | HTMLElement>(null);

  return (
    <>
      <Chip
        icon={<LocationOnIcon sx={{ fontSize: '14px !important', color: `${tokens.primary} !important` }} />}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <span style={{ fontWeight: 600 }}>{city}</span>
            <KeyboardArrowDownIcon sx={{ fontSize: 14, color: tokens.textMuted }} />
          </Box>
        }
        onClick={(e) => setCityAnchor(e.currentTarget)}
        sx={{
          bgcolor: tokens.surface2,
          border: `1px solid ${tokens.border}`,
          color: tokens.textSecondary,
          borderRadius: '9999px',
          fontSize: '0.82rem',
          cursor: 'pointer',
          py: 0.5,
          display: { xs: 'none', md: 'flex' },
          transition: 'all 0.2s',
          '&:hover': { borderColor: tokens.borderHover, bgcolor: tokens.surface3, color: tokens.textPrimary },
        }}
      />
      <Menu
        anchorEl={cityAnchor}
        open={Boolean(cityAnchor)}
        onClose={() => setCityAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              bgcolor: tokens.surface,
              border: `1px solid ${tokens.border}`,
              borderRadius: '16px',
              minWidth: 160,
              boxShadow: tokens.shadowDropdown,
              backdropFilter: 'blur(16px)',
              p: 0.5,
            },
          },
        }}
      >
        {CITIES.map((c) => (
          <MenuItem
            key={c}
            selected={c === city}
            onClick={() => {
              setCity(c);
              setCityAnchor(null);
            }}
            sx={{ borderRadius: '10px', mx: 0.5, fontSize: '0.875rem', fontWeight: 500 }}
          >
            {c}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
