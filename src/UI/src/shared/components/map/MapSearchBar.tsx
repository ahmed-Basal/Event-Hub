import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import { tokens } from '../../../theme';
import { locationIqApi } from '../../api';
import type { LocationIQResult } from '../../types';

interface MapSearchBarProps {
  onLocationSelect?: (coords: [number, number], placeInfo?: { venue?: string; city?: string }) => void;
}

export default function MapSearchBar({ onLocationSelect }: MapSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationIQResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await locationIqApi.autocomplete({
          query: val,
          limit: 6,
          countrycodes: 'eg',
          acceptLanguage: 'ar,en',
        });
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectSearchResult = (result: LocationIQResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      const selectedVenue =
        result.display_place ||
        result.address?.name ||
        result.display_name.split(',')[0] ||
        '';
      const selectedCity =
        result.address?.city ||
        result.address?.town ||
        result.address?.state ||
        '';

      onLocationSelect?.([lat, lon], {
        venue: selectedVenue,
        city: selectedCity,
      });
      setShowDropdown(false);
      setSearchQuery(selectedVenue);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 64,
        maxWidth: 380,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.6,
          borderRadius: '12px',
          bgcolor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${tokens.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <SearchIcon sx={{ color: tokens.primary, fontSize: 20, mr: 1 }} />
        <InputBase
          fullWidth
          placeholder="Search place, venue, or address in Egypt..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setShowDropdown(true);
          }}
          sx={{
            color: tokens.textPrimary,
            fontSize: '0.85rem',
            '& input::placeholder': {
              color: tokens.textMuted,
              opacity: 1,
            },
          }}
        />
        {isSearching && (
          <CircularProgress size={16} sx={{ color: tokens.primary, mr: 0.5 }} />
        )}
        {searchQuery && (
          <IconButton
            size="small"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowDropdown(false);
            }}
            sx={{ p: 0.5, color: tokens.textMuted }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Paper>

      {/* Autocomplete Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <Paper
          elevation={6}
          sx={{
            mt: 1,
            borderRadius: '12px',
            bgcolor: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadowDropdown,
            maxHeight: 220,
            overflowY: 'auto',
            p: 0.5,
          }}
        >
          {searchResults.map((result) => {
            const mainName =
              result.display_place ||
              result.address?.name ||
              result.display_name.split(',')[0];
            const subName =
              result.display_address ||
              [result.address?.city, result.address?.state, result.address?.country]
                .filter(Boolean)
                .join(', ');

            return (
              <Box
                key={result.place_id}
                onClick={() => handleSelectSearchResult(result)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.2,
                  px: 1.5,
                  py: 1,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: `${tokens.primary}25`,
                  },
                }}
              >
                <PlaceIcon sx={{ fontSize: 18, color: tokens.primary, mt: 0.2 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: tokens.textPrimary,
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {mainName}
                  </Typography>
                  {subName && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: tokens.textMuted,
                        fontSize: '0.72rem',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {subName}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
}
