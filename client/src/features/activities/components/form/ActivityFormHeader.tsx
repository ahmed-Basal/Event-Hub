import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { tokens } from '../../../../theme';

export interface ActivityFormHeaderProps {
  isEditMode: boolean;
  activityId?: string;
}

export default function ActivityFormHeader({ isEditMode, activityId }: ActivityFormHeaderProps) {
  return (
    <>
      {/* Navigation Breadcrumb / Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          to={isEditMode && activityId ? `/activities/${activityId}` : '/activities'}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: tokens.textSecondary,
            fontWeight: 600,
            fontSize: '0.875rem',
            '&:hover': {
              color: tokens.primary,
              bgcolor: 'rgba(255, 255, 255, 0.04)',
            },
          }}
        >
          {isEditMode ? 'Back to Event' : 'Back to Events'}
        </Button>
      </Box>

      {/* Form Card Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          pb: 3,
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              bgcolor: `${tokens.primary}18`,
              color: tokens.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${tokens.primary}33`,
            }}
          >
            {isEditMode ? <EditCalendarIcon /> : <EventNoteIcon />}
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: tokens.textPrimary,
                letterSpacing: '-0.02em',
              }}
            >
              {isEditMode ? 'Edit Meetup Event' : 'Create Meetup Event'}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.textSecondary, mt: 0.3 }}>
              {isEditMode
                ? 'Update event schedule, location, or details'
                : 'Publish a new developer meetup, workshop, or conference'}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={isEditMode ? 'Edit Mode' : 'New Meetup'}
          sx={{
            bgcolor: isEditMode ? `${tokens.teal}18` : `${tokens.primary}18`,
            color: isEditMode ? tokens.teal : tokens.primary,
            border: `1px solid ${isEditMode ? tokens.teal : tokens.primary}40`,
            fontWeight: 700,
            fontSize: '0.78rem',
            borderRadius: '9999px',
            px: 0.5,
          }}
        />
      </Box>
    </>
  );
}
