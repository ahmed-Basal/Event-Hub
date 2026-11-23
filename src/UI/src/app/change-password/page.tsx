'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Paper, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { accountApi } from '@features/Account/Frontend';
import { tokens } from '@/theme/tokens';
import FormTextField from '@/ui/form/FormTextField';

const schema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await accountApi.changePassword(values);
    toast.success('Password changed successfully!');
    router.push('/activities');
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 460, mx: 'auto', mt: 6, p: 4, borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Typography variant="h5" fontWeight={700} color={tokens.primaryLight}>
        Change Password
      </Typography>
      <FormTextField name="currentPassword" control={control} label="Current Password" type="password" />
      <FormTextField name="newPassword" control={control} label="New Password" type="password" />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </Button>
    </Paper>
  );
}
