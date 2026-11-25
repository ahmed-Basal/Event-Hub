'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import FormTextField from '@/ui/form/FormTextField';
import {
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { profilesApi } from '@modules/profiles';
import { ACCOUNT_QUERY_KEY, useAccount } from '@modules/identity';
import { getCategoryImage } from '@modules/activities';
import type { UserProfile } from '@modules/profiles';
import { tokens } from '@/theme/tokens';
import ProfileCard from './ProfileCard';

const PhotoUploadWidget = dynamic(() => import('./PhotoUploadWidget'), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={280} sx={{ bgcolor: tokens.surface2 }} />,
});

interface Props {
  username: string;
  initialProfile?: UserProfile | null;
}

const editProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  bio: z.string().max(1000).optional(),
});
type EditProfileValues = z.infer<typeof editProfileSchema>;

export default function ProfilePageClient({ username, initialProfile }: Props) {
  const queryClient = useQueryClient();
  const { currentUser, isLoggedIn } = useAccount();
  const [tab, setTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [addPhotoMode, setAddPhotoMode] = useState(false);
  const [eventPredicate, setEventPredicate] = useState<'future' | 'past' | 'hosting'>('future');

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: initialProfile?.displayName || '',
      bio: initialProfile?.bio || '',
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profiles', username],
    queryFn: () => profilesApi.get(username),
    initialData: initialProfile ?? undefined,
  });

  useEffect(() => {
    if (profile) {
      reset({ displayName: profile.displayName, bio: profile.bio || '' });
    }
  }, [profile, reset]);

  const { data: userActivities = [] } = useQuery({
    queryKey: ['profiles', username, 'activities', eventPredicate],
    queryFn: () => profilesApi.activities(username, eventPredicate),
    enabled: tab === 2,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['profiles', username, 'follow-list', 'followers'],
    queryFn: () => profilesApi.followList(username, 'followers'),
    enabled: tab === 3,
  });

  const { data: followings = [] } = useQuery({
    queryKey: ['profiles', username, 'follow-list', 'followings'],
    queryFn: () => profilesApi.followList(username, 'followings'),
    enabled: tab === 4,
  });

  const followMutation = useMutation({
    mutationFn: () => profilesApi.followToggle(username),
    onSuccess: (nowFollowing) => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username] });
      queryClient.invalidateQueries({ queryKey: ['profiles', username, 'follow-list'] });
      toast.success(nowFollowing ? `Following ${profile?.displayName}` : 'Unfollowed');
    },
  });

  const editProfileMutation = useMutation({
    mutationFn: (values: EditProfileValues) => profilesApi.edit(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username] });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setEditMode(false);
      toast.success('Profile updated!');
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (blob: Blob) => profilesApi.uploadPhoto(blob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username] });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setAddPhotoMode(false);
      toast.success('Photo uploaded!');
    },
  });

  const setMainMutation = useMutation({
    mutationFn: (photoId: string) => profilesApi.setMainPhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username] });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      toast.success('Main photo updated!');
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => profilesApi.deletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username] });
      toast.success('Photo deleted.');
    },
  });

  if (isLoading || !profile) {
    return <Skeleton variant="rounded" height={360} sx={{ borderRadius: '16px', bgcolor: tokens.surface }} />;
  }

  const isCurrentUser = Boolean(currentUser && currentUser.username === profile.username);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Neil-style ProfileHeader */}
      <Paper sx={{ p: 4, borderRadius: '18px' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                src={profile.image || '/images/user.png'}
                alt={profile.displayName}
                sx={{
                  width: 128,
                  height: 128,
                  border: `3px solid ${tokens.primary}`,
                  boxShadow: tokens.shadowPrimary,
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h4" fontWeight={800}>
                  {profile.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{profile.username}
                </Typography>
                {profile.following && (
                  <Chip
                    label="Following"
                    size="small"
                    sx={{
                      width: 'fit-content',
                      bgcolor: `${tokens.teal}22`,
                      color: tokens.teal,
                      border: `1px solid ${tokens.teal}55`,
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2} alignItems="center">
              <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={800} color={tokens.primaryLight}>
                    {profile.followersCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Followers
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={800} color={tokens.teal}>
                    {profile.followingCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Following
                  </Typography>
                </Box>
              </Box>

              {isLoggedIn && !isCurrentUser && (
                <>
                  <Divider sx={{ width: '100%' }} />
                  <Button
                    fullWidth
                    variant={profile.following ? 'outlined' : 'contained'}
                    color={profile.following ? 'secondary' : 'primary'}
                    disabled={followMutation.isPending}
                    onClick={() => followMutation.mutate()}
                  >
                    {profile.following ? 'Unfollow' : 'Follow'}
                  </Button>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Neil-style ProfileContent (Vertical Tabs) */}
      <Paper sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, borderRadius: '18px', minHeight: 420 }}>
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderRight: { md: `1px solid ${tokens.border}` },
            minWidth: { md: 200 },
            py: 2,
          }}
        >
          <Tab label="About" sx={{ alignItems: 'flex-start', px: 3 }} />
          <Tab label="Photos" sx={{ alignItems: 'flex-start', px: 3 }} />
          <Tab label="Events" sx={{ alignItems: 'flex-start', px: 3 }} />
          <Tab label={`Followers (${profile.followersCount})`} sx={{ alignItems: 'flex-start', px: 3 }} />
          <Tab label={`Following (${profile.followingCount})`} sx={{ alignItems: 'flex-start', px: 3 }} />
        </Tabs>

        <Box sx={{ flex: 1, p: 3.5 }}>
          {/* Tab 0: About */}
          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  About {profile.displayName}
                </Typography>
                {isCurrentUser && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      reset({ displayName: profile.displayName, bio: profile.bio || '' });
                      setEditMode((v) => !v);
                    }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              {editMode ? (
                <Box
                  component="form"
                  onSubmit={handleSubmit((vals) => editProfileMutation.mutate(vals))}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 520 }}
                >
                  <FormTextField name="displayName" control={control} label="Display Name" />
                  <FormTextField name="bio" control={control} label="Bio" multiline rows={4} />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || editProfileMutation.isPending}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {editProfileMutation.isPending ? 'Saving...' : 'Update Profile'}
                  </Button>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {profile.bio || 'No bio added yet.'}
                </Typography>
              )}
            </Box>
          )}

          {/* Tab 1: Photos */}
          {tab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Photos
                </Typography>
                {isCurrentUser && (
                  <Button variant="outlined" size="small" onClick={() => setAddPhotoMode((v) => !v)}>
                    {addPhotoMode ? 'Cancel' : 'Add Photo'}
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              {addPhotoMode ? (
                <PhotoUploadWidget
                  onUpload={(blob) => uploadPhotoMutation.mutate(blob)}
                  uploading={uploadPhotoMutation.isPending}
                />
              ) : profile.photos.length === 0 ? (
                <Typography color="text.secondary">No photos uploaded yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {profile.photos.map((photo) => (
                    <Grid key={photo.id} size={{ xs: 6, sm: 4, md: 3 }}>
                      <Box
                        sx={{
                          position: 'relative',
                          aspectRatio: '1/1',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          border: `2px solid ${photo.isMain ? tokens.teal : tokens.border}`,
                        }}
                      >
                        <Image
                          src={photo.url}
                          alt="Profile photo"
                          fill
                          sizes="220px"
                          style={{ objectFit: 'cover' }}
                        />
                        {isCurrentUser && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              display: 'flex',
                              gap: 0.5,
                              bgcolor: `${tokens.bg}cc`,
                              borderRadius: '10px',
                              p: 0.3,
                            }}
                          >
                            <IconButton
                              size="small"
                              disabled={photo.isMain || setMainMutation.isPending}
                              onClick={() => setMainMutation.mutate(photo.id)}
                              sx={{ color: photo.isMain ? tokens.teal : tokens.textPrimary }}
                            >
                              {photo.isMain ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                            </IconButton>
                            {!photo.isMain && (
                              <IconButton
                                size="small"
                                disabled={deletePhotoMutation.isPending}
                                onClick={() => deletePhotoMutation.mutate(photo.id)}
                                sx={{ color: tokens.accent }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 2: Events */}
          {tab === 2 && (
            <Box>
              <Tabs
                value={eventPredicate}
                onChange={(_, v) => setEventPredicate(v)}
                sx={{ mb: 2.5, borderBottom: `1px solid ${tokens.border}` }}
              >
                <Tab value="future" label="Future Events" />
                <Tab value="past" label="Past Events" />
                <Tab value="hosting" label="Hosting" />
              </Tabs>

              {userActivities.length === 0 ? (
                <Typography color="text.secondary">No events in this category.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {userActivities.map((act) => (
                    <Grid key={act.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        component={Link}
                        href={`/activities/${act.id}`}
                        sx={{
                          display: 'block',
                          textDecoration: 'none',
                          overflow: 'hidden',
                          '&:hover': { borderColor: tokens.borderHover },
                        }}
                      >
                        <Box sx={{ position: 'relative', height: 110 }}>
                          <Image
                            src={getCategoryImage(act.category, act.image)}
                            alt={act.title}
                            fill
                            sizes="280px"
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>
                        <CardContent sx={{ p: 1.8 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {act.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(act.date), 'dd MMM yyyy h:mm a')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 3: Followers */}
          {tab === 3 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {followers.length === 0 ? (
                <Typography color="text.secondary">No followers yet.</Typography>
              ) : (
                followers.map((f) => (
                  <ProfileCard
                    key={f.username}
                    username={f.username}
                    displayName={f.displayName}
                    bio={f.bio}
                    image={f.image}
                    following={f.following}
                    followersCount={f.followersCount}
                  />
                ))
              )}
            </Box>
          )}

          {/* Tab 4: Following */}
          {tab === 4 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {followings.length === 0 ? (
                <Typography color="text.secondary">Not following anyone yet.</Typography>
              ) : (
                followings.map((f) => (
                  <ProfileCard
                    key={f.username}
                    username={f.username}
                    displayName={f.displayName}
                    bio={f.bio}
                    image={f.image}
                    following={f.following}
                    followersCount={f.followersCount}
                  />
                ))
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
