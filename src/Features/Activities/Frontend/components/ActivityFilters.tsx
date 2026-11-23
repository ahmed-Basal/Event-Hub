'use client';

import dynamic from 'next/dynamic';
import {
  Box,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import {
  Event as EventIcon,
  FilterList as FilterListIcon,
  LocationCity as CityIcon,
} from '@mui/icons-material';
import { ACTIVITY_CATEGORIES } from '@features/Activities/Frontend';
import { tokens } from '@/theme/tokens';

const Calendar = dynamic(() => import('react-calendar'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 280, bgcolor: tokens.surface2, borderRadius: '14px' }} />
  ),
});

const CITIES = ['Cairo', 'Alexandria', 'Giza', 'New Cairo', 'Mansoura', 'Assiut'] as const;

interface ActivityFiltersProps {
  filter: string;
  category: string;
  city: string;
  startDate: Date | null;
  isLoggedIn: boolean;
  onFilterChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStartDateChange: (date: Date | null) => void;
}

export default function ActivityFilters({
  filter,
  category,
  city,
  startDate,
  isLoggedIn,
  onFilterChange,
  onCategoryChange,
  onCityChange,
  onStartDateChange,
}: ActivityFiltersProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: 'sticky', top: 92 }}>
      <Paper sx={{ p: 2.5, borderRadius: '16px' }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: tokens.primaryLight }}
        >
          <FilterListIcon fontSize="small" />
          Filters
        </Typography>

        <MenuList disablePadding>
          <MenuItem selected={filter === 'all'} onClick={() => onFilterChange('all')}>
            <ListItemText primary="All events" />
          </MenuItem>
          {isLoggedIn && (
            <>
              <MenuItem selected={filter === 'isGoing'} onClick={() => onFilterChange('isGoing')}>
                <ListItemText primary="I'm going" />
              </MenuItem>
              <MenuItem selected={filter === 'isHost'} onClick={() => onFilterChange('isHost')}>
                <ListItemText primary="I'm hosting" />
              </MenuItem>
              <MenuItem
                selected={filter === 'isFollowing'}
                onClick={() => onFilterChange('isFollowing')}
              >
                <ListItemText primary="People I follow" />
              </MenuItem>
            </>
          )}
        </MenuList>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            Category
          </Typography>
          <Select
            fullWidth
            size="small"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            sx={{ borderRadius: '10px', bgcolor: tokens.surface2 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {ACTIVITY_CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}
          >
            <CityIcon sx={{ fontSize: 14, color: tokens.teal }} />
            City
          </Typography>
          <Select
            fullWidth
            size="small"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            sx={{ borderRadius: '10px', bgcolor: tokens.surface2 }}
          >
            <MenuItem value="all">All Cities</MenuItem>
            {CITIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, color: tokens.teal }}
          >
            <EventIcon fontSize="small" />
            Select date
          </Typography>
          {startDate && (
            <Typography
              variant="caption"
              onClick={() => onStartDateChange(null)}
              sx={{ color: tokens.accent, cursor: 'pointer', fontWeight: 600 }}
            >
              Clear
            </Typography>
          )}
        </Box>
        <Calendar
          value={startDate || new Date()}
          onChange={(val) => {
            if (val instanceof Date) onStartDateChange(val);
          }}
        />
      </Paper>
    </Box>
  );
}
