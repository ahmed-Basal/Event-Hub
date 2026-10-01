import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Spinner,
  TagInput,
  POPULAR_TAGS,
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  activitySchema,
  TextInput,
  TextArea,
  SelectInput,
  DateInput,
  type ActivityFormData,
  type SchemaCategory,
} from '../../../shared';
import { tokens } from '../../../theme';
import { useActivityDetail, useActivityMutations } from '../hooks';


export default function ActivityForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // SRP Hooks
  const { activity, isLoading: isLoadingActivity } = useActivityDetail(id);
  const { createActivity, updateActivity, isMutating } = useActivityMutations(id);

  const {
    handleSubmit,
    control,
    reset,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'BackEnd' as SchemaCategory,
      level: 'All Levels',
      date: '',
      city: '',
      venue: '',
      tags: [],
    },
  });

  // Populate form values when editing an existing activity
  useEffect(() => {
    if (activity) {
      reset({
        title: activity.title ?? '',
        description: activity.description ?? '',
        category: (activity.category as SchemaCategory) ?? 'BackEnd',
        level: activity.level ?? 'All Levels',
        date: activity.date ? activity.date.split('T')[0] : '',
        city: activity.city ?? '',
        venue: activity.venue ?? '',
        tags: activity.tags ?? [],
      });
    }
  }, [activity, reset]);

  const closeForm = () => navigate('/activities');

  const onSubmit = async (data: ActivityFormData) => {
    if (activity && id) {
      await updateActivity.mutateAsync({
        ...activity,
        ...data,
        id,
      });
      closeForm();
    } else {
      createActivity.mutate(
        {
          ...data,
          latitude: 30.0444, // Default Cairo coords
          longitude: 31.2357,
          isCancelled: false,
        },
        {
          onSuccess: (newId) => {
            navigate(`/activities/${newId}`);
          },
        }
      );
    }
  };

  if (isLoadingActivity) {
    return <Spinner message="Loading meetup details..." minHeight={340} />;
  }

  return (
    <Box sx={{ maxWidth: 840, mx: 'auto', mb: 8, mt: 1 }}>
      {/* ── Breadcrumb / Back Link ── */}
      <Button
        onClick={closeForm}
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        sx={{
          color: tokens.textSecondary,
          mb: 2.5,
          px: 1.5,
          py: 0.6,
          borderRadius: '10px',
          fontSize: '0.85rem',
          '&:hover': {
            color: tokens.textPrimary,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
      >
        Back to Meetups
      </Button>

      {/* ── Main Form Surface ── */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          borderRadius: '24px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadowCard,
          p: { xs: 2.5, sm: 4.5 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent}, ${tokens.teal})`,
          },
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              bgcolor: `${tokens.primary}18`,
              border: `1px solid ${tokens.primary}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.primary,
              boxShadow: tokens.shadowGold,
              flexShrink: 0,
            }}
          >
            {activity ? (
              <EditNoteIcon sx={{ fontSize: 30 }} />
            ) : (
              <AddCircleIcon sx={{ fontSize: 28 }} />
            )}
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: tokens.textPrimary,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {activity ? 'Edit Tech Meetup' : 'Create New Tech Meetup'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: tokens.textSecondary,
                mt: 0.5,
              }}
            >
              {activity
                ? 'Update the agenda, speakers, topics, and logistics for this event.'
                : 'Publish an upcoming session, hands-on workshop, or community summit.'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: tokens.border, mb: 3.5 }} />

        {/* ── Form with React Hook Form + Shared Form Components ── */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3.2 }}
        >
          {/* 1. Title */}
          <TextInput
            name="title"
            control={control}
            label="Event Title"
            required
            placeholder="e.g. Cairo .NET 9 & Microservices Summit"
          />

          {/* 2. Category & Level Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            <SelectInput
              name="category"
              control={control}
              label="Technical Track"
              options={CATEGORY_OPTIONS}
            />

            <SelectInput
              name="level"
              control={control}
              label="Audience Level"
              options={LEVEL_OPTIONS}
            />
          </Box>

          {/* 3. Description */}
          <TextArea
            name="description"
            control={control}
            label="Detailed Agenda & Overview"
            required
            rows={4}
            placeholder="Describe the key takeaways, speakers, prerequisites, and what developers will build or learn..."
          />

          {/* 4. Interactive Tags Manager */}
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                suggestions={POPULAR_TAGS}
              />
            )}
          />

          {/* 5. Date & Schedule */}
          <DateInput
            name="date"
            control={control}
            label="Event Date"
            required
          />

          {/* 6. Location: City & Venue */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            <TextInput
              name="city"
              control={control}
              label="City"
              required
              placeholder="e.g. Cairo, Alexandria, Giza, Assiut"
            />

            <TextInput
              name="venue"
              control={control}
              label="Venue / Address"
              required
              placeholder="e.g. The GrEEK Campus, Downtown Cairo"
            />
          </Box>

          <Divider sx={{ borderColor: tokens.border, my: 1 }} />

          {/* ── Action Buttons ── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Button
              onClick={closeForm}
              disabled={isMutating}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.1,
                color: tokens.textSecondary,
                border: `1px solid ${tokens.border}`,
                fontSize: '0.9rem',
                fontWeight: 600,
                '&:hover': {
                  color: tokens.textPrimary,
                  borderColor: tokens.borderHover,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isMutating}
              startIcon={
                isMutating ? undefined : activity ? (
                  <SaveIcon />
                ) : (
                  <RocketLaunchIcon />
                )
              }
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.2,
                fontSize: '0.92rem',
                fontWeight: 700,
                bgcolor: tokens.primary,
                color: tokens.bg,
                boxShadow: tokens.shadowGold,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#e08e0a',
                  boxShadow: '0px 12px 36px 0px rgba(245, 158, 11, 0.38)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {isMutating
                ? activity
                  ? 'Saving changes...'
                  : 'Publishing meetup...'
                : activity
                ? 'Save Changes'
                : 'Publish Meetup'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
