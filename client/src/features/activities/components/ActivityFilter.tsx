import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AppsIcon from '@mui/icons-material/Apps';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TuneIcon from '@mui/icons-material/Tune';
import { tokens } from '../../../theme';

export interface ActivityFilterValues {
  category: string;
  status: string;
  date?: Date;
}

export interface ActivityFilterProps {
  value?: ActivityFilterValues;
  onChange?: (next: ActivityFilterValues) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: <AppsIcon sx={{ fontSize: 16 }} /> },
  { id: 'backend', label: 'BackEnd', icon: <StorageIcon sx={{ fontSize: 16 }} /> },
  { id: 'frontend', label: 'FrontEnd', icon: <CodeIcon sx={{ fontSize: 16 }} /> },
  { id: 'cybersecurity', label: 'CyberSecurity', icon: <SecurityIcon sx={{ fontSize: 16 }} /> },
  { id: 'dataanalysis', label: 'Data Analysis', icon: <BarChartIcon sx={{ fontSize: 16 }} /> },
  { id: 'devops', label: 'DevOps', icon: <CloudSyncIcon sx={{ fontSize: 16 }} /> },
];

const STATUS_FILTERS = [
  { id: 'all', label: 'All Events' },
  { id: 'going', label: "I'm Going" },
  { id: 'hosting', label: "I'm Hosting" },
];

export default function ActivityFilter({ value, onChange }: ActivityFilterProps) {
  const [internalCategory, setInternalCategory] = useState('all');
  const [internalStatus, setInternalStatus] = useState('all');
  const [internalDate, setInternalDate] = useState<Date>(new Date());

  const activeCategory = value ? value.category : internalCategory;
  const activeStatus = value ? value.status : internalStatus;
  const calDate = value?.date ?? internalDate;

  const handleCategoryChange = (catId: string) => {
    if (onChange) {
      onChange({ category: catId, status: activeStatus, date: calDate });
    } else {
      setInternalCategory(catId);
    }
  };

  const handleStatusChange = (statusId: string) => {
    if (onChange) {
      onChange({ category: activeCategory, status: statusId, date: calDate });
    } else {
      setInternalStatus(statusId);
    }
  };

  const handleDateChange = (date: Date) => {
    if (onChange) {
      onChange({ category: activeCategory, status: activeStatus, date });
    } else {
      setInternalDate(date);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      <Paper sx={{ p: 2.5, borderRadius: '18px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TuneIcon sx={{ fontSize: 18, color: tokens.primary }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tokens.textPrimary }}>
            Filter Events
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s.id}
              fullWidth
              onClick={() => handleStatusChange(s.id)}
              variant={activeStatus === s.id ? 'contained' : 'text'}
              color={activeStatus === s.id ? 'primary' : 'inherit'}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: activeStatus === s.id ? 700 : 400,
                color: activeStatus === s.id ? tokens.bg : tokens.textSecondary,
                px: 2,
                py: 1,
                '&:hover': {
                  bgcolor: activeStatus === s.id ? undefined : 'rgba(255,255,255,0.05)',
                  color: activeStatus === s.id ? undefined : tokens.textPrimary,
                },
              }}
            >
              {s.label}
            </Button>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: '18px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AppsIcon sx={{ fontSize: 18, color: tokens.teal }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tokens.textPrimary }}>
            Categories
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <Chip
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                onClick={() => handleCategoryChange(cat.id)}
                sx={{
                  borderRadius: '9999px',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                  bgcolor: isActive ? tokens.primary : 'rgba(255,255,255,0.04)',
                  color: isActive ? tokens.bg : tokens.textSecondary,
                  border: `1px solid ${isActive ? tokens.primary : tokens.border}`,
                  boxShadow: isActive ? tokens.shadowGold : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '& .MuiChip-icon': {
                    color: isActive ? tokens.bg : tokens.textMuted,
                  },
                  '&:hover': {
                    bgcolor: isActive ? undefined : 'rgba(255,255,255,0.08)',
                    borderColor: isActive ? undefined : tokens.borderHover,
                    color: isActive ? undefined : tokens.textPrimary,
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: '18px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarMonthIcon sx={{ fontSize: 18, color: tokens.accent }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tokens.textPrimary }}>
            Select Date
          </Typography>
        </Box>
        <Box
          sx={{
            '& .react-calendar': {
              bgcolor: 'transparent !important',
              border: 'none !important',
              width: '100% !important',
              fontFamily: "'Inter', sans-serif !important",
              color: `${tokens.textPrimary} !important`,
            },
            '& .react-calendar__tile': {
              borderRadius: '8px !important',
              color: `${tokens.textSecondary} !important`,
              '&:hover': { bgcolor: `rgba(255,255,255,0.08) !important` },
            },
            '& .react-calendar__tile--active': {
              bgcolor: `${tokens.primary} !important`,
              color: `${tokens.bg} !important`,
              fontWeight: '700 !important',
            },
            '& .react-calendar__tile--now': {
              bgcolor: `${tokens.teal}22 !important`,
              color: `${tokens.teal} !important`,
            },
            '& .react-calendar__navigation button': {
              color: `${tokens.textSecondary} !important`,
              borderRadius: '8px !important',
              '&:hover': { bgcolor: `rgba(255,255,255,0.08) !important` },
            },
            '& .react-calendar__month-view__weekdays__weekday': {
              color: `${tokens.textMuted} !important`,
            },
          }}
        >
          <Calendar
            value={calDate}
            onChange={(val) => {
              if (val instanceof Date) handleDateChange(val);
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
