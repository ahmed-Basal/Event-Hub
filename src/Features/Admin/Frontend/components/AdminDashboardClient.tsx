'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  AttachMoney as MoneyIcon,
  ConfirmationNumber as TicketIcon,
  EventAvailable as EventIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { adminApi } from '../api/adminApi';
import type { AdminDashboardDto, AdminUserDto } from '../types';
import { useAccount } from '@features/Account/Frontend';
import { tokens } from '@/theme/tokens';

const ALL_ROLES = ['Admin', 'Organizer', 'Member'] as const;

export default function AdminDashboardClient() {
  const queryClient = useQueryClient();
  const { currentUser, isLoading: authLoading } = useAccount();
  const isAdmin = Boolean(currentUser?.roles?.includes('Admin'));
  const [tab, setTab] = useState(0);

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUserDto[]>({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getUsers,
    enabled: isAdmin,
  });

  const { data: dashboard, isLoading: dashLoading } = useQuery<AdminDashboardDto>({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
    enabled: isAdmin,
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({ username, roles }: { username: string; roles: string[] }) =>
      adminApi.updateRoles(username, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User roles updated!');
    },
  });

  const refundMutation = useMutation({
    mutationFn: (orderId: string) => adminApi.refundOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Order refunded and attendee notified via SSE!');
    },
  });

  const toggleCancelMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleCancelActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity status updated!');
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity deleted.');
    },
  });

  if (authLoading && !currentUser) {
    return <Skeleton variant="rounded" height={360} sx={{ borderRadius: '18px', bgcolor: tokens.surface }} />;
  }

  if (!isAdmin) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" fontWeight={700} color={tokens.accent}>
          Admin Access Required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in with an Administrator account to access the Admin Control Center.
        </Typography>
        <Button component={Link} href="/login" variant="contained">
          Sign In as Admin
        </Button>
      </Paper>
    );
  }

  const kpis = dashboard?.kpis;
  const maxTrackAttendees = Math.max(
    1,
    ...(dashboard?.trackAnalytics.map((t) => t.attendeesCount) ?? [1])
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, borderRadius: '18px', display: 'flex', alignItems: 'center', gap: 2 }}>
        <AdminIcon sx={{ fontSize: 38, color: tokens.primaryLight }} />
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Admin Control Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage RBAC roles, inspect revenue &amp; Stripe refunds, moderate events, and track community analytics.
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={2.5}>
        {[
          {
            label: 'Total Revenue',
            value: `$${(kpis?.totalRevenue ?? 0).toFixed(2)}`,
            icon: <MoneyIcon sx={{ color: tokens.teal }} />,
            accent: tokens.teal,
          },
          {
            label: 'Paid Tickets',
            value: kpis?.paidOrdersCount ?? 0,
            icon: <TicketIcon sx={{ color: tokens.gold }} />,
            accent: tokens.gold,
          },
          {
            label: 'Developers',
            value: kpis?.totalUsers ?? users.length,
            icon: <GroupsIcon sx={{ color: tokens.primaryLight }} />,
            accent: tokens.primaryLight,
          },
          {
            label: 'Active / Cancelled Events',
            value: `${kpis?.activeEventsCount ?? 0} / ${kpis?.cancelledEventsCount ?? 0}`,
            icon: <EventIcon sx={{ color: tokens.primary }} />,
            accent: tokens.primary,
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: '16px',
                borderTop: `3px solid ${card.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                  {dashLoading ? '—' : card.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '12px',
                  bgcolor: `${card.accent}1a`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {dashboard?.trackAnalytics && dashboard.trackAnalytics.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: '18px' }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Track Attendance &amp; Revenue Analytics
          </Typography>
          <Grid container spacing={2}>
            {dashboard.trackAnalytics.map((track) => (
              <Grid key={track.track} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: tokens.surface2, border: `1px solid ${tokens.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {track.track}
                    </Typography>
                    <Typography variant="caption" color={tokens.teal} fontWeight={700}>
                      ${track.revenue.toFixed(0)} rev
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(track.attendeesCount / maxTrackAttendees) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: tokens.bg,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.teal})`,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                    {track.eventsCount} events • {track.attendeesCount} attendees
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Paper sx={{ borderRadius: '18px', overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2, bgcolor: tokens.surface2, borderBottom: `1px solid ${tokens.border}` }}
        >
          <Tab label={`Users & Roles (${users.length})`} />
          <Tab label={`Orders & Refunds (${dashboard?.orders.length ?? 0})`} />
          <Tab label={`Events Moderation (${dashboard?.activities.length ?? 0})`} />
        </Tabs>

        {tab === 0 && (
          usersLoading ? (
            <Skeleton variant="rounded" height={280} sx={{ bgcolor: tokens.surface }} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: tokens.surface2 }}>
                    <TableCell sx={{ fontWeight: 700 }}>Developer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Active Roles</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assign Roles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{u.displayName}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: tokens.textSecondary }}>{u.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          {u.roles.map((r) => (
                            <Chip
                              key={r}
                              size="small"
                              label={r}
                              sx={{
                                bgcolor:
                                  r === 'Admin'
                                    ? `${tokens.gold}22`
                                    : r === 'Organizer'
                                      ? `${tokens.primary}22`
                                      : `${tokens.teal}22`,
                                color:
                                  r === 'Admin'
                                    ? tokens.gold
                                    : r === 'Organizer'
                                      ? tokens.primaryLight
                                      : tokens.teal,
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {ALL_ROLES.map((role) => {
                            const checked = u.roles.includes(role);
                            return (
                              <FormControlLabel
                                key={role}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={checked}
                                    disabled={updateRolesMutation.isPending}
                                    onChange={() => {
                                      const next = checked
                                        ? u.roles.filter((r) => r !== role)
                                        : [...u.roles, role];
                                      updateRolesMutation.mutate({ username: u.username, roles: next });
                                    }}
                                  />
                                }
                                label={role}
                              />
                            );
                          })}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}

        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: tokens.surface2 }}>
                  <TableCell sx={{ fontWeight: 700 }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(dashboard?.orders ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: tokens.textSecondary }}>
                      No ticket orders yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  dashboard?.orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{order.buyerDisplayName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.buyerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          component={Link}
                          href={`/activities/${order.activityId}`}
                          sx={{ color: tokens.primaryLight, textDecoration: 'none', fontWeight: 600 }}
                        >
                          {order.activityTitle}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>${order.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={order.status}
                          sx={{
                            bgcolor:
                              order.status === 'Paid'
                                ? `${tokens.teal}22`
                                : order.status === 'Refunded'
                                  ? `${tokens.accent}22`
                                  : `${tokens.gold}22`,
                            color:
                              order.status === 'Paid'
                                ? tokens.teal
                                : order.status === 'Refunded'
                                  ? tokens.accent
                                  : tokens.gold,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: tokens.textSecondary }}>
                        {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {order.status === 'Paid' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            disabled={refundMutation.isPending}
                            onClick={() => refundMutation.mutate(order.id)}
                          >
                            Refund
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: tokens.surface2 }}>
                  <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Host</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Attendees</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(dashboard?.activities ?? []).map((act) => (
                  <TableRow key={act.id} hover>
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/activities/${act.id}`}
                        sx={{ color: tokens.primaryLight, textDecoration: 'none', fontWeight: 700 }}
                      >
                        {act.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{act.hostDisplayName}</TableCell>
                    <TableCell>{act.city}</TableCell>
                    <TableCell>{act.attendeesCount}</TableCell>
                    <TableCell>{act.price > 0 ? `$${act.price}` : 'Free'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={act.isCancelled ? 'Cancelled' : 'Active'}
                        sx={{
                          bgcolor: act.isCancelled ? `${tokens.accent}22` : `${tokens.teal}22`,
                          color: act.isCancelled ? tokens.accent : tokens.teal,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={toggleCancelMutation.isPending}
                          onClick={() => toggleCancelMutation.mutate(act.id)}
                        >
                          {act.isCancelled ? 'Re-activate' : 'Cancel'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          disabled={deleteActivityMutation.isPending}
                          onClick={() => deleteActivityMutation.mutate(act.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
