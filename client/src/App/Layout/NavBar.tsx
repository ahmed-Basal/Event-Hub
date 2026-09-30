import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router';
import { tokens } from '../../theme';
import { MenuItemLink } from '../../shared';

const CITIES = ['Cairo', 'Alexandria', 'Giza', 'El Gouna', 'Dahab', 'Sahel'];

export default function NavBar() {
  const [city, setCity] = useState('Cairo');
  const [cityAnchor, setCityAnchor] = useState<null | HTMLElement>(null);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 1,
            minHeight: { xs: 64, md: 72 },
          }}
        >
          {/* ── Brand Logo ──────────────────────────────── */}
          <Box
            component={NavLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {/* Icon square */}
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: tokens.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: tokens.shadowGold,
                fontSize: '1.1rem',
                fontWeight: 800,
                color: tokens.bg,
                fontFamily: 'monospace',
                letterSpacing: '-1px',
                userSelect: 'none',
                position: 'relative',
              }}
            >
              {'</>'}
              {/* Red dot */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: tokens.accent,
                }}
              />
            </Box>

            {/* Brand text */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '-2px', lineHeight: 1 }}>
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: tokens.textPrimary,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                لمه مبرمجين
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  color: tokens.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                }}
              >
                Egypt
              </Typography>
            </Box>
          </Box>

          {/* ── City Selector ────────────────────────────── */}
          <Chip
            icon={<LocationOnIcon sx={{ fontSize: '14px !important', color: `${tokens.textSecondary} !important` }} />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <span>{city}</span>
                <KeyboardArrowDownIcon sx={{ fontSize: 14, color: tokens.textMuted }} />
              </Box>
            }
            onClick={(e) => setCityAnchor(e.currentTarget)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${tokens.border}`,
              color: tokens.textSecondary,
              borderRadius: '9999px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: { xs: 'none', md: 'flex' },
              '&:hover': { borderColor: tokens.borderHover, bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          />
          <Menu
            anchorEl={cityAnchor}
            open={Boolean(cityAnchor)}
            onClose={() => setCityAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  bgcolor: tokens.surface2,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: '14px',
                  minWidth: 160,
                },
              },
            }}
          >
            {CITIES.map((c) => (
              <MenuItem
                key={c}
                selected={c === city}
                onClick={() => { setCity(c); setCityAnchor(null); }}
                sx={{ borderRadius: '8px', mx: 0.5, fontSize: '0.875rem' }}
              >
                {c}
              </MenuItem>
            ))}
          </Menu>

          {/* ── Search Bar ───────────────────────────────── */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              maxWidth: 380,
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${searchFocused ? tokens.primary : tokens.border}`,
              borderRadius: '9999px',
              px: 2,
              py: 0.6,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: searchFocused ? `0 0 0 2px ${tokens.primary}33` : 'none',
            }}
          >
            <SearchIcon sx={{ fontSize: 17, color: tokens.textMuted }} />
            <InputBase
              placeholder="Search events, topics, cities..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              sx={{
                fontSize: '0.85rem',
                color: tokens.textPrimary,
                flex: 1,
                '& input::placeholder': { color: tokens.textMuted, opacity: 1 },
              }}
            />
          </Box>

          {/* ── Nav Actions ──────────────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Explore link */}
            <Button
              component={NavLink}
              to="/activities"
              variant="text"
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: tokens.textSecondary,
                px: 1.5,
                fontSize: '0.875rem',
                '&.active': { color: tokens.primary },
                '&:hover': { color: tokens.textPrimary, bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Explore
            </Button>

            {/* Errors link */}
            <Button
              component={NavLink}
              to="/errors"
              variant="text"
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: tokens.textSecondary,
                px: 1.5,
                fontSize: '0.875rem',
                '&.active': { color: tokens.primary },
                '&:hover': { color: tokens.textPrimary, bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Errors
            </Button>

            {/* Create Activity button */}
            <Button
              component={NavLink}
              to="/createActivity"
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                borderColor: tokens.border,
                color: tokens.textSecondary,
                fontSize: '0.8rem',
                px: 2,
                '&:hover': { borderColor: tokens.primary, color: tokens.primary },
              }}
            >
              Create Activity
            </Button>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tokens.border}`,
                  width: 38,
                  height: 38,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <Badge
                  variant="dot"
                  sx={{ '& .MuiBadge-dot': { bgcolor: tokens.accent, right: 2, top: 2 } }}
                >
                  <NotificationsNoneIcon sx={{ fontSize: 19, color: tokens.textSecondary }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Avatar */}
            <Tooltip title="Profile">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: tokens.primary,
                  color: tokens.bg,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `2px solid ${tokens.border}`,
                  '&:hover': { border: `2px solid ${tokens.primary}` },
                  transition: 'border-color 0.2s',
                }}
              >
                A
              </Avatar>
            </Tooltip>

            {/* Mobile menu icon */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: tokens.textSecondary }}
              onClick={(e) => setMobileAnchor(e.currentTarget)}
            >
              <MenuIcon />
            </IconButton>

            {/* Mobile Navigation Dropdown */}
            <Menu
              anchorEl={mobileAnchor}
              open={Boolean(mobileAnchor)}
              onClose={() => setMobileAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    bgcolor: tokens.surface2,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '14px',
                    minWidth: 180,
                    p: 0.5,
                  },
                },
              }}
            >
              <MenuItemLink to="/" onClick={() => setMobileAnchor(null)}>
                Home
              </MenuItemLink>
              <MenuItemLink to="/activities" onClick={() => setMobileAnchor(null)}>
                Explore
              </MenuItemLink>
              <MenuItemLink to="/createActivity" onClick={() => setMobileAnchor(null)}>
                Create Activity
              </MenuItemLink>
              <MenuItemLink to="/errors" onClick={() => setMobileAnchor(null)}>
                Errors
              </MenuItemLink>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
