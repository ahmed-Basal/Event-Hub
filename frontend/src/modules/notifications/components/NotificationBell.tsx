'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DoneAll as DoneAllIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { tokens } from '@/theme/tokens';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(true);

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Live SSE Notifications">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            color: tokens.textPrimary,
            bgcolor: open ? `${tokens.primary}22` : 'transparent',
            border: `1px solid ${open ? tokens.borderHover : 'transparent'}`,
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="secondary"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: tokens.accent,
                color: '#FFFFFF',
                fontWeight: 700,
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxWidth: '92vw',
              mt: 1,
              borderRadius: '16px',
              bgcolor: tokens.surface,
              border: `1px solid ${tokens.border}`,
              boxShadow: tokens.shadowDropdown,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            bgcolor: tokens.surface2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications
            </Typography>
            <Box
              component="span"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                px: 1,
                py: 0.2,
                borderRadius: '9999px',
                bgcolor: `${tokens.teal}22`,
                color: tokens.teal,
              }}
            >
              SSE LIVE
            </Box>
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={() => markAllRead.mutate()}
              sx={{ color: tokens.primaryLight, fontSize: '0.75rem' }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        <List sx={{ maxHeight: 380, overflowY: 'auto', p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                You&apos;re all caught up!
              </Typography>
            </Box>
          ) : (
            notifications.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => {
                  if (!item.isRead) markRead.mutate(item.id);
                  setAnchorEl(null);
                  if (item.targetUrl) router.push(item.targetUrl);
                }}
                sx={{
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 1.5,
                  px: 2,
                  bgcolor: item.isRead ? 'transparent' : `${tokens.primary}12`,
                  borderBottom: `1px solid ${tokens.border}`,
                  '&:hover': { bgcolor: tokens.surface2 },
                }}
              >
                <Avatar
                  src={item.actorImage || '/images/user.png'}
                  alt={item.actorDisplayName || 'User'}
                  sx={{ width: 36, height: 36, mt: 0.3, border: `1px solid ${tokens.border}` }}
                />
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: tokens.textPrimary, lineHeight: 1.4 }}>
                      {item.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: tokens.textMuted }}>
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Typography>
                  }
                />
                {!item.isRead && (
                  <CircleIcon sx={{ fontSize: 9, color: tokens.accent, mt: 1 }} />
                )}
              </ListItemButton>
            ))
          )}
        </List>
      </Popover>
    </>
  );
}
