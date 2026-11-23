'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Paper, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { activitiesApi } from '@features/Activities/Frontend';
import { ACTIVITY_CATEGORIES } from '@features/Activities/Frontend';
import { localInputToUtcIso, utcToLocalInputValue } from '@/core/utils/dateUtils';
import { tokens } from '@/theme/tokens';
import FormTextField from '@/ui/form/FormTextField';
import FormSelectField from '@/ui/form/FormSelectField';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  city: z.string().min(2, 'City is required'),
  venue: z.string().min(2, 'Venue is required'),
  price: z.number().min(0),
  latitude: z.number(),
  longitude: z.number(),
});

type FormValues = z.infer<typeof schema>;

export default function ActivityFormClient({ activityId }: { activityId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(activityId);

  const { data: existing } = useQuery({
    queryKey: ['activities', activityId],
    queryFn: () => activitiesApi.details(activityId!),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'backend',
      date: utcToLocalInputValue(new Date(Date.now() + 86400_000).toISOString()),
      city: 'Cairo',
      venue: '',
      price: 0,
      latitude: 30.0444,
      longitude: 31.2357,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description,
        category: existing.category,
        date: utcToLocalInputValue(existing.date),
        city: existing.city,
        venue: existing.venue,
        price: existing.price ?? 0,
        latitude: existing.latitude,
        longitude: existing.longitude,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        date: localInputToUtcIso(values.date),
      };
      return isEdit
        ? activitiesApi.update(activityId!, payload)
        : activitiesApi.create(payload);
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(isEdit ? 'Activity updated!' : 'Activity created!');
      router.push(`/activities/${isEdit ? activityId : id}`);
    },
  });

  return (
    <Paper sx={{ maxWidth: 680, mx: 'auto', p: 4, borderRadius: '18px' }}>
      <Typography variant="h5" fontWeight={700} color={tokens.primaryLight} mb={3}>
        {isEdit ? 'Edit Activity' : 'Create Activity'}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit((vals) => mutation.mutate(vals))}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <FormTextField name="title" control={control} label="Title" />
        <FormTextField name="description" control={control} label="Description" multiline rows={3} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <FormSelectField
              name="category"
              control={control}
              label="Category"
              options={ACTIVITY_CATEGORIES}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <FormTextField
              name="date"
              control={control}
              type="datetime-local"
              label="Date & Time"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <FormTextField name="city" control={control} label="City" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <FormTextField name="venue" control={control} label="Venue" />
          </Box>
        </Box>

        <FormTextField
          name="price"
          control={control}
          type="number"
          label="Ticket Price in USD (0 = Free)"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Activity'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
