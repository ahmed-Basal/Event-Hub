import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import {
  TextInput,
  TextArea,
  SelectInput,
  DateInput,
  Spinner,
} from '../../../shared';
import {
  activitySchema,
  type ActivityFormData,
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  type SchemaCategory,
  type SchemaLevel,
} from '../schemas';
import { TagInput } from '../components/form';
import { tokens } from '../../../theme';
import { useActivityDetail, useActivityMutations } from '../hooks';
import {
  ActivityFormHeader,
  ActivityCoverImageField,
  ActivityLocationField,
  ActivityFormActions,
} from '../components/form';

export default function ActivityForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { activity, isLoading: isLoadingActivity } = useActivityDetail(id);
  const { createActivity, updateActivity } = useActivityMutations(id);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [mapCoords, setMapCoords] = useState<[number, number]>([30.0444, 31.2357]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      image: '',
      latitude: 30.0444,
      longitude: 31.2357,
      level: 'All Levels',
      tags: [],
    },
  });

  const watchedImage = watch('image');

  // Populate form if editing existing activity
  useEffect(() => {
    if (activity) {
      const initialImg = activity.image || '';
      reset({
        title: activity.title,
        description: activity.description,
        category: (activity.category as SchemaCategory) || 'BackEnd',
        date: activity.date ? new Date(activity.date).toISOString().slice(0, 16) : '',
        city: activity.city,
        venue: activity.venue,
        image: initialImg,
        latitude: activity.latitude || 30.0444,
        longitude: activity.longitude || 31.2357,
        level: (activity.level as SchemaLevel) || 'All Levels',
        tags: activity.tags || [],
      });
      setSelectedImage(initialImg);

      const lat = Number(activity.latitude);
      const lon = Number(activity.longitude);
      if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
        setMapCoords([lat, lon]);
      }
    }
  }, [activity, reset]);

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const formattedDate = new Date(data.date).toISOString();
      const finalImage =
        data.image ||
        selectedImage ||
        `/images/categoryImages/${(data.category || 'backend').toLowerCase()}.jpg`;
      const finalLat = mapCoords[0] || 30.0444;
      const finalLon = mapCoords[1] || 31.2357;

      if (id && activity) {
        await updateActivity.mutateAsync({
          ...activity,
          ...data,
          date: formattedDate,
          image: finalImage,
          latitude: finalLat,
          longitude: finalLon,
        });
        navigate(`/activities/${activity.id}`);
      } else {
        const newId = await createActivity.mutateAsync({
          ...data,
          date: formattedDate,
          image: finalImage,
          latitude: finalLat,
          longitude: finalLon,
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
        <ActivityFormHeader isEditMode={isEditMode} activityId={id} />

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

              {/* Cover Image Upload & Direct URL */}
              <Grid size={{ xs: 12 }}>
                <ActivityCoverImageField
                  control={control}
                  setValue={setValue}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  watchedImage={watchedImage}
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

              {/* City, Venue & Interactive Leaflet Map */}
              <ActivityLocationField
                control={control}
                setValue={setValue}
                watch={watch}
                mapCoords={mapCoords}
                setMapCoords={setMapCoords}
              />

              {/* Dynamic Topic Tags */}
              <Grid size={{ xs: 12 }}>
                <TagInput
                  control={control}
                  name="tags"
                  label="Technical Topics & Tags"
                  placeholder="Type a tag (e.g. C#, React, Docker) and press Enter"
                />
              </Grid>

              {/* Form Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <ActivityFormActions
                  isPending={isPending}
                  isEditMode={isEditMode}
                  isValid={isValid}
                  isDirty={isDirty}
                  onCancel={handleCancel}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}