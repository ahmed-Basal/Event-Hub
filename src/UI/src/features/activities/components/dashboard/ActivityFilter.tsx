import { useState, useMemo } from 'react';
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
import EventIcon from '@mui/icons-material/Event';
import TuneIcon from '@mui/icons-material/Tune';
import { useActivitiesList } from '../../hooks';
import { formatDate } from '../../../../shared';
import { tokens } from '../../../../theme';

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
  const [internalDate, setInternalDate] = useState<Date | undefined>(undefined);

  const activeCategory = value ? value.category : internalCategory;
  const activeStatus = value ? value.status : internalStatus;
  const activeDate = value ? value.date : internalDate;

  // Fetch all activities once to mark dates with events on the calendar
  const { activities } = useActivitiesList();
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    activities?.forEach((act) => {
      if (act.date) {
        dates.add(act.date.split('T')[0]);
      }
    });
    return dates;
  }, [activities]);

  const handleCategoryChange = (catId: string) => {
    if (onChange) {
      onChange({ category: catId, status: activeStatus, date: activeDate });
    } else {
      setInternalCategory(catId);
    }
  };

  const handleStatusChange = (statusId: string) => {
    if (onChange) {
      onChange({ category: activeCategory, status: statusId, date: activeDate });
    } else {
      setInternalStatus(statusId);
    }
  };

  const handleDateChange = (date: Date) => {
    // If user clicks the currently active date, toggle it off (clear)
    const isSameDay =
      activeDate &&
      activeDate.getFullYear() === date.getFullYear() &&
      activeDate.getMonth() === date.getMonth() &&
      activeDate.getDate() === date.getDate();

    const nextDate = isSameDay ? undefined : date;

    if (onChange) {
      onChange({ category: activeCategory, status: activeStatus, date: nextDate });
    } else {
      setInternalDate(nextDate);
    }
  };

  const handleClearDate = () => {
    if (onChange) {
      onChange({ category: activeCategory, status: activeStatus, date: undefined });
    } else {
      setInternalDate(undefined);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Status Filter */}
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

      {/* Category Chips */}
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

      {/* Calendar Filter */}
      <Paper sx={{ p: 2.5, borderRadius: '18px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 18, color: tokens.accent }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tokens.textPrimary }}>
              Select Date
            </Typography>
          </Box>
          {activeDate && (
            <Button
              size="small"
              onClick={handleClearDate}
              sx={{
                fontSize: '0.75rem',
                color: tokens.accent,
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                fontWeight: 600,
              }}
            >
              Show All
            </Button>
          )}
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
              borderRadius: '10px !important',
              color: `${tokens.textSecondary} !important`,
              position: 'relative',
              padding: '6px 2px !important',
              minHeight: '46px !important',
              display: 'flex !important',
              flexDirection: 'column !important',
              alignItems: 'center !important',
              justifyContent: 'flex-start !important',
              transition: 'all 0.15s ease !important',
              '&:hover': { bgcolor: `rgba(255,255,255,0.08) !important` },
            },
            '& .react-calendar__tile--active': {
              bgcolor: `${tokens.primary} !important`,
              color: `${tokens.bg} !important`,
              fontWeight: '700 !important',
            },
            '& .react-calendar__tile--now': {
              border: `1.5px solid ${tokens.gold} !important`,
              bgcolor: 'rgba(245, 158, 11, 0.12) !important',
              color: `${tokens.gold} !important`,
              fontWeight: '800 !important',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.25) !important',
            },
            '& .react-calendar__tile--now.react-calendar__tile--active': {
              bgcolor: `${tokens.primary} !important`,
              border: `2px solid ${tokens.gold} !important`,
              color: `${tokens.bg} !important`,
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.5) !important',
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
            value={activeDate ?? null}
            onChange={(val) => {
              if (val instanceof Date) handleDateChange(val);
            }}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const key = `${year}-${month}-${day}`;
                const hasEvent = eventDates.has(key);

                const now = new Date();
                const isToday =
                  date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

                return (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.2,
                      mt: 0.2,
                    }}
                  >
                    {isToday && (
                      <Box
                        sx={{
                          fontSize: '0.52rem',
                          fontWeight: 800,
                          lineHeight: 1,
                          color: tokens.gold,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          px: 0.5,
                          py: 0.1,
                          borderRadius: '4px',
                          bgcolor: 'rgba(245, 158, 11, 0.2)',
                        }}
                      >
                        Today
                      </Box>
                    )}
                    {hasEvent && (
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          bgcolor: tokens.teal,
                          boxShadow: `0 0 6px ${tokens.teal}`,
                        }}
                      />
                    )}
                  </Box>
                );
              }
              return null;
            }}
          />
        </Box>

        {/* Selected date indicator */}
        {activeDate ? (
          <Box
            sx={{
              mt: 2,
              p: 1.2,
              borderRadius: '12px',
              bgcolor: 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${tokens.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon sx={{ fontSize: 16, color: tokens.primary }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.textPrimary }}>
                {formatDate(activeDate, 'dd MMM yyyy')}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={handleClearDate}
              sx={{
                fontSize: '0.72rem',
                p: 0.2,
                minWidth: 'auto',
                color: tokens.accent,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Clear ✕
            </Button>
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: tokens.textMuted,
              textAlign: 'center',
              mt: 1.8,
            }}
          >
            ⭐ <strong style={{ color: tokens.gold }}>Today</strong> is highlighted in gold • 🟢 Dots indicate scheduled meetups
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
