import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { tokens } from '../../../theme';

export default function MapHintBadge() {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <Chip
        size="small"
        label="📍 Click on the map or drag the pin to set exact location"
        sx={{
          bgcolor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          color: tokens.primary,
          fontWeight: 600,
          fontSize: '0.72rem',
          border: `1px solid ${tokens.border}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      />
    </Box>
  );
}
