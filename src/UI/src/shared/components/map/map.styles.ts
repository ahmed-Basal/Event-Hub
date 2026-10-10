import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme';

export function getMapContainerStyles(
  width: number | string,
  height: number | string,
  borderRadius: number | string,
  customSx?: SxProps<Theme>
): SxProps<Theme> {
  return {
    width,
    height,
    borderRadius,
    overflow: 'hidden',
    position: 'relative',
    border: `1px solid ${tokens.border}`,
    boxShadow: tokens.shadowCard,
    bgcolor: tokens.surface,
    '& .leaflet-container': {
      width: '100%',
      height: '100%',
      fontFamily: 'inherit',
      bgcolor: '#1e293b',
      zIndex: 1,
    },
    '& .custom-event-marker': {
      background: 'transparent !important',
      border: 'none !important',
    },
    '& .leaflet-tooltip': {
      bgcolor: `${tokens.surface} !important`,
      color: `${tokens.textPrimary} !important`,
      border: `1px solid ${tokens.border} !important`,
      borderRadius: '10px !important',
      boxShadow: `${tokens.shadowDropdown} !important`,
      fontWeight: 700,
      fontSize: '0.8rem !important',
      px: 1.5,
      py: 0.6,
      whiteSpace: 'nowrap',
      '&:before': {
        borderTopColor: `${tokens.border} !important`,
      },
    },
    '& .leaflet-popup-content-wrapper': {
      bgcolor: tokens.surface,
      color: tokens.textPrimary,
      border: `1px solid ${tokens.border}`,
      borderRadius: '14px',
      boxShadow: tokens.shadowDropdown,
      p: 0,
    },
    '& .leaflet-popup-content': {
      m: '12px 16px',
      lineHeight: 1.4,
    },
    '& .leaflet-popup-tip': {
      bgcolor: tokens.surface,
      border: `1px solid ${tokens.border}`,
    },
    '& .leaflet-popup-close-button': {
      color: `${tokens.textMuted} !important`,
      top: '8px !important',
      right: '8px !important',
      '&:hover': {
        color: `${tokens.primary} !important`,
      },
    },
    '@keyframes marker-pulse': {
      '0%': { transform: 'scale(0.8)', opacity: 0.8 },
      '100%': { transform: 'scale(1.9)', opacity: 0 },
    },
    ...(Array.isArray(customSx) ? customSx : [customSx]),
  };
}
