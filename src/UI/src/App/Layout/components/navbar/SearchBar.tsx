import { useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { tokens } from '../../../../theme';

export default function SearchBar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        maxWidth: 380,
        alignItems: 'center',
        gap: 1.2,
        bgcolor: tokens.surface2,
        border: `1px solid ${searchFocused ? tokens.primary : tokens.border}`,
        borderRadius: '9999px',
        px: 2.2,
        py: 0.7,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: searchFocused ? `0 0 0 3px ${tokens.primaryGlow}` : 'none',
      }}
    >
      <SearchIcon
        sx={{
          fontSize: 18,
          color: searchFocused ? tokens.primary : tokens.textMuted,
          transition: 'color 0.2s',
        }}
      />
      <InputBase
        placeholder="Search events, topics, cities..."
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        sx={{
          fontSize: '0.875rem',
          color: tokens.textPrimary,
          flex: 1,
          '& input::placeholder': { color: tokens.textMuted, opacity: 1 },
        }}
      />
    </Box>
  );
}
