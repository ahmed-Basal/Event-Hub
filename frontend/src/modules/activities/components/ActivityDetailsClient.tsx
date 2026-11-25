'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  Info as InfoIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { activitiesApi } from '@modules/activities';
import { paymentsApi } from '@modules/payments';
import { useAccount } from '@modules/identity';
import { getCategoryImage, type Activity } from '@modules/activities';
import { tokens } from '@/theme/tokens';
import { ActivityDetailsChat } from '@modules/comments';

const MapComponent = dynamic(() => import('@/ui/MapComponent'), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={320} sx={{ bgcolor: tokens.surface2 }} />,
});

interface Props {
  activityId: string;
  initialActivity?: Activity | null;
}

export default function ActivityDetailsClient({ activityId, initialActivity }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentUser, isLoggedIn } = useAccount();
  const [mapOpen, setMapOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const checkoutKeyRef = useRef<string | null>(null);

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activities', activityId],
    queryFn: () => activitiesApi.details(activityId),
    initialData: initialActivity ?? undefined,
  });

  const attendMutation = useMutation({
    mutationFn: () => activitiesApi.attend(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Updated event status!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => activitiesApi.delete(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity deleted.');
      router.push('/activities');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => {
      if (!checkoutKeyRef.current) {
        checkoutKeyRef.current = crypto.randomUUID();
      }
      return paymentsApi.checkout(activityId, checkoutKeyRef.current);
    },
    onSuccess: (session) => {
      window.location.href = session.checkoutUrl;
    },
  });

  if (isLoading || !activity) {
    return <Skeleton variant="rounded" height={420} sx={{ borderRadius: '16px', bgcolor: tokens.surface }} />;
  }

  const isHost = Boolean(currentUser && activity.hostUsername === currentUser.username);
  const isGoing = Boolean(
    currentUser && activity.attendees.some((a) => a.username === currentUser.username)
  );
  const coverSrc = getCategoryImage(activity.category, activity.image);

  return (
    <Grid container spacing={3}>
      {/* Left 8 Columns: Header + Info + Live SignalR Chat */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Neil-style ActivityDetailsHeader */}
          <Card sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
            {activity.isCancelled && (
              <Chip
                label="Cancelled"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 3,
                  bgcolor: tokens.accent,
                  color: '#FFFFFF',
                  fontWeight: 700,
                }}
              />
            )}

            <Box sx={{ position: 'relative', height: 320, width: '100%' }}>
              <Image
                src={coverSrc}
                alt={activity.title}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 66vw"
                style={{ objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(to top, ${tokens.bg}f2 8%, ${tokens.bg}55 55%, transparent 100%)`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  p: 3,
                }}
              >
                <Box>
                  <Typography variant="h4" fontWeight={800}>
                    {activity.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {format(new Date(activity.date), 'dd MMM yyyy h:mm a')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hosted by{' '}
                    <Box
                      component={Link}
                      href={`/profiles/${activity.hostUsername || 'host'}`}
                      sx={{ color: tokens.primaryLight, fontWeight: 700, textDecoration: 'none' }}
                    >
                      {activity.hostDisplayName || activity.hostUsername}
                    </Box>
                  </Typography>
                  {activity.tags?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.2 }}>
                      {activity.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={`#${tag}`}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.72rem',
                            bgcolor: 'rgba(19, 26, 45, 0.85)',
                            color: tokens.primaryLight,
                            border: `1px solid ${tokens.border}`,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {isLoggedIn && (
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {isHost ? (
                      <>
                        <Button
                          variant="contained"
                          color={activity.isCancelled ? 'info' : 'secondary'}
                          disabled={attendMutation.isPending}
                          onClick={() => attendMutation.mutate()}
                        >
                          {activity.isCancelled ? 'Re-activate Activity' : 'Cancel Activity'}
                        </Button>
                        <Button
                          component={Link}
                          href={`/manage/${activity.id}`}
                          variant="contained"
                          color="primary"
                          disabled={activity.isCancelled}
                        >
                          Manage Event
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : activity.price && activity.price > 0 && !isGoing ? (
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={checkoutMutation.isPending || activity.isCancelled}
                        onClick={() => checkoutMutation.mutate()}
                      >
                        {checkoutMutation.isPending
                          ? 'Redirecting to Checkout...'
                          : `Buy Ticket ($${activity.price})`}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color={isGoing ? 'secondary' : 'primary'}
                        disabled={attendMutation.isPending || activity.isCancelled}
                        onClick={() => attendMutation.mutate()}
                      >
                        {isGoing ? 'Cancel Attendance' : 'Join Free Event'}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Card>

          {/* Neil-style ActivityDetailsInfo + Dynamic Map */}
          <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <InfoIcon sx={{ color: tokens.primaryLight }} />
              <Typography variant="body1">{activity.description}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <CalendarTodayIcon sx={{ color: tokens.teal }} />
              <Typography variant="body1">
                {format(new Date(activity.date), 'dd MMM yyyy h:mm a')}
              </Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PlaceIcon sx={{ color: tokens.accent }} />
                <Typography variant="body1">
                  {activity.venue}, {activity.city}
                </Typography>
              </Box>
              <Button variant="outlined" size="small" onClick={() => setMapOpen((v) => !v)}>
                {mapOpen ? 'Hide Map' : 'Show Map'}
              </Button>
            </Box>
            {mapOpen && (
              <Box sx={{ height: 320, px: 2.5, pb: 2.5 }}>
                <MapComponent
                  position={[activity.latitude || 30.0444, activity.longitude || 31.2357]}
                  venue={activity.venue}
                />
              </Box>
            )}
          </Paper>

          {/* Neil-style Live SignalR Chat */}
          <ActivityDetailsChat activityId={activity.id} hostUsername={activity.hostUsername} />
        </Box>
      </Grid>

      {/* Right 4 Columns: Neil-style ActivityDetailsSidebar */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ borderRadius: '16px', overflow: 'hidden', position: 'sticky', top: 92 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 1.8,
              px: 2,
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="#FFFFFF">
              {activity.attendees.length}{' '}
              {activity.attendees.length === 1 ? 'person' : 'people'} going
            </Typography>
          </Box>

          <List sx={{ p: 1.5 }}>
            {activity.attendees.map((attendee) => (
              <ListItem
                key={attendee.username}
                component={Link}
                href={`/profiles/${attendee.username}`}
                sx={{
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: tokens.textPrimary,
                  '&:hover': { bgcolor: tokens.surface2 },
                }}
                secondaryAction={
                  attendee.isHost ? (
                    <Chip
                      label="Host"
                      size="small"
                      sx={{
                        bgcolor: `${tokens.primary}22`,
                        color: tokens.primaryLight,
                        border: `1px solid ${tokens.primary}55`,
                      }}
                    />
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={attendee.image || '/images/user.png'}
                    alt={attendee.displayName}
                    sx={{
                      width: 48,
                      height: 48,
                      border: `2px solid ${attendee.following ? tokens.teal : tokens.border}`,
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography fontWeight={700}>{attendee.displayName}</Typography>}
                  secondary={
                    attendee.following ? (
                      <Typography variant="caption" sx={{ color: tokens.teal, fontWeight: 600 }}>
                        Following
                      </Typography>
                    ) : null
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Activity</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete &ldquo;{activity.title}&rdquo;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="secondary"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
