import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import {
  TextInput,
  TextArea,
  SelectInput,
  DateInput,
  TagInput,
  Spinner,
  activitySchema,
  type ActivityFormData,
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  type SchemaCategory,
  type SchemaLevel,
} from '../../../shared';
import { tokens } from '../../../theme';
import { useActivityDetail, useActivityMutations } from '../hooks';

export default function ActivityForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { activity, isLoading: isLoadingActivity } = useActivityDetail(id);
  const { createActivity, updateActivity } = useActivityMutations(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      category: 'BackEnd',
      date: '',
      city: '',
      venue: '',
      level: 'All Levels',
      tags: [],
    },
  });

  // Populate form if editing existing activity
  useEffect(() => {
    if (activity) {
      reset({
        title: activity.title,
        description: activity.description,
        category: (activity.category as SchemaCategory) || 'BackEnd',
        date: activity.date ? new Date(activity.date).toISOString().slice(0, 16) : '',
        city: activity.city,
        venue: activity.venue,
        level: (activity.level as SchemaLevel) || 'All Levels',
        tags: activity.tags || [],
      });
    }
  }, [activity, reset]);

  const onSubmit = async (data: ActivityFormData) => {
    try {
      // Normalize date to ISO string for backend
      const formattedDate = new Date(data.date).toISOString();

      if (id && activity) {
        await updateActivity.mutateAsync({
          ...activity,
          ...data,
          date: formattedDate,
        });
        navigate(`/activities/${activity.id}`);
      } else {
        const newId = await createActivity.mutateAsync({
          ...data,
          date: formattedDate,
          latitude: 30.0444,
          longitude: 31.2357,
          isCancelled: false,
        } as any);

        if (newId) {
          navigate(`/activities/${newId}`);
        } else {
          navigate('/activities');
        }
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/activities/${id}`);
    } else {
      navigate('/activities');
    }
  };

  if (isLoadingActivity) {
    return <Spinner message="Loading activity details..." minHeight="60vh" />;
  }

  const isPending = createActivity.isPending || updateActivity.isPending || isSubmitting;
  const isEditMode = Boolean(id);

  return (
    <Box sx={{ bgcolor: tokens.bg, minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        {/* Navigation Breadcrumb / Back button */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to={isEditMode ? `/activities/${id}` : '/activities'}
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

        {/* Main Form Paper */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            bgcolor: tokens.surface,
            border: `1px solid ${tokens.border}`,
            borderRadius: '24px',
            boxShadow: tokens.shadowCard,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Top Accent Glow */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`,
            }}
          />

          {/* Form Header */}
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

          {/* Form Body */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={3}>
              {/* Event Title */}
              <Grid size={{ xs: 12 }}>
                <TextInput
                  control={control}
                  name="title"
                  label="Event Title"
                  placeholder="e.g. Modern .NET 9 Architecture & Clean APIs"
                />
              </Grid>

              {/* Category & Experience Level */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectInput
                  control={control}
                  name="category"
                  label="Category / Track"
                  items={CATEGORY_OPTIONS}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectInput
                  control={control}
                  name="level"
                  label="Audience Level"
                  items={LEVEL_OPTIONS}
                />
              </Grid>

              {/* Description */}
              <Grid size={{ xs: 12 }}>
                <TextArea
                  control={control}
                  name="description"
                  label="Event Description"
                  rows={4}
                  placeholder="Provide an overview of the event, what developers will learn, and agenda details..."
                />
              </Grid>

              {/* Date & Time */}
              <Grid size={{ xs: 12 }}>
                <DateInput
                  control={control}
                  name="date"
                  label="Date & Time"
                />
              </Grid>

              {/* City & Venue */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                  control={control}
                  name="city"
                  label="City"
                  placeholder="e.g. Cairo, Alexandria, Giza"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                  control={control}
                  name="venue"
                  label="Venue / Host Space"
                  placeholder="e.g. Greek Campus, Co-working Hub"
                />
              </Grid>

              {/* Dynamic Topic Tags */}
              <Grid size={{ xs: 12 }}>
                <TagInput
                  control={control}
                  name="tags"
                  label="Technical Topics & Tags"
                  placeholder="Type a tag (e.g. C#, React, Docker) and press Enter"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 2,
                    pt: 2,
                    borderTop: `1px solid ${tokens.border}`,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isPending}
                    startIcon={<CancelIcon />}
                    sx={{
                      borderRadius: '12px',
                      px: 3,
                      py: 1.1,
                      color: tokens.textSecondary,
                      borderColor: tokens.border,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: tokens.borderHover,
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        color: tokens.textPrimary,
                      },
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending || !isValid || (isEditMode && !isDirty)}
                    startIcon={
                      isPending ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    sx={{
                      borderRadius: '12px',
                      px: 4,
                      py: 1.1,
                      bgcolor: tokens.primary,
                      color: tokens.bg,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      boxShadow: tokens.shadowGold,
                      '&:hover': {
                        bgcolor: '#e08e0a',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        color: tokens.textMuted,
                      },
                    }}
                  >
                    {isPending
                      ? 'Submitting...'
                      : isEditMode
                      ? 'Update Event'
                      : 'Create Event'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}