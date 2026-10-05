import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LayersIcon from '@mui/icons-material/Layers';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckIcon from '@mui/icons-material/Check';
import { tokens } from '../../../theme';
import type { TileThemeType, TileConfigItem } from './map.types';

interface MapControlsProps {
  activeTheme: TileThemeType;
  onThemeChange: (theme: TileThemeType) => void;
  tileConfig: Record<TileThemeType, TileConfigItem>;
  googleMapsUrl: string;
  showTileSwitcher?: boolean;
  showDirectionsLink?: boolean;
}

export default function MapControls({
  activeTheme,
  onThemeChange,
  tileConfig,
  googleMapsUrl,
  showTileSwitcher = true,
  showDirectionsLink = true,
}: MapControlsProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1000,
        display: 'flex',
        gap: 1,
      }}
    >
      {showTileSwitcher && (
        <>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            title="Change Map Style"
            sx={{
              bgcolor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(30, 41, 59, 0.95)',
                color: tokens.primary,
              },
            }}
          >
            <LayersIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: '12px',
                  boxShadow: tokens.shadowDropdown,
                  minWidth: 190,
                },
              },
            }}
          >
            {(Object.keys(tileConfig) as TileThemeType[]).map((themeKey) => (
              <MenuItem
                key={themeKey}
                selected={activeTheme === themeKey}
                onClick={() => {
                  onThemeChange(themeKey);
                  setMenuAnchor(null);
                }}
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: activeTheme === themeKey ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                {tileConfig[themeKey].label}
                {activeTheme === themeKey && (
                  <CheckIcon sx={{ fontSize: 16, color: tokens.primary }} />
                )}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {showDirectionsLink && (
        <IconButton
          size="small"
          component="a"
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps"
          sx={{
            bgcolor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            color: tokens.textPrimary,
            border: `1px solid ${tokens.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            '&:hover': {
              bgcolor: 'rgba(30, 41, 59, 0.95)',
              color: tokens.primary,
            },
          }}
        >
          <OpenInNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  );
}
