import {
  Paper,
  Typography,
  List,
  ListItem,
  Chip,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Button,
  Divider,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Star as StarIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { Link } from 'react-router';
import { tokens, type Attendee } from '../../../lib';

const ATTENDEES: Attendee[] = [
  {
    id: '1',
    name: 'Bob',
    role: 'Principal Engineer & Organizer',
    avatar: '/images/user.png',
    isHost: true,
    isFollowing: true,
    badgeColor: tokens.primary,
  },
  {
    id: '2',
    name: 'Ahmed Saad',
    role: 'Full Stack .NET Developer',
    avatar: '/images/user.png',
    badgeColor: tokens.teal,
  },
  {
    id: '3',
    name: 'Sarah Nour',
    role: 'Cloud & DevOps Specialist',
    avatar: '/images/user.png',
    badgeColor: tokens.accent,
  },
];

export default function ActivityDetailsSidebar() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: 'sticky', top: 88 }}>
      {/* ── Attendees Card ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadowCard,
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            borderBottom: `1px solid ${tokens.border}`,
            bgcolor: tokens.surface2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                bgcolor: `${tokens.teal}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.teal,
              }}
            >
              <GroupsIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
              Attendees
            </Typography>
          </Box>

          <Chip
            label={`${ATTENDEES.length} Going`}
            size="small"
            sx={{
              bgcolor: `${tokens.primary}18`,
              color: tokens.primary,
              border: `1px solid ${tokens.primary}44`,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* List of Attendees */}
        <List disablePadding sx={{ py: 1 }}>
          {ATTENDEES.map((attendee, index) => (
            <Box key={attendee.id}>
              <ListItem
                sx={{
                  px: 2.5,
                  py: 1.5,
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 46 }}>
                  <Avatar
                    alt={attendee.name}
                    src={attendee.avatar}
                    sx={{
                      width: 38,
                      height: 38,
                      border: `1.5px solid ${attendee.badgeColor || tokens.border}`,
                    }}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography
                        component={Link}
                        to="/profiles/bob"
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: tokens.textPrimary,
                          textDecoration: 'none',
                          '&:hover': { color: tokens.primary },
                        }}
                      >
                        {attendee.name}
                      </Typography>
                      {attendee.isHost && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: '13px !important', color: `${tokens.primary} !important` }} />}
                          label="Host"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: `${tokens.primary}20`,
                            color: tokens.primary,
                            border: `1px solid ${tokens.primary}40`,
                            px: 0.2,
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: tokens.textMuted, display: 'block', mt: 0.3 }}>
                      {attendee.role}
                    </Typography>
                  }
                />

                {attendee.isFollowing && (
                  <Chip
                    label="Following"
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: tokens.textSecondary,
                    }}
                  />
                )}
              </ListItem>
              {index < ATTENDEES.length - 1 && (
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)', mx: 2.5 }} />
              )}
            </Box>
          ))}
        </List>

        {/* Share Button Footer */}
        <Box sx={{ p: 2, borderTop: `1px solid ${tokens.border}`, bgcolor: tokens.surface3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleShare}
            startIcon={<ShareIcon />}
            sx={{
              borderRadius: '12px',
              py: 1,
              borderColor: tokens.border,
              color: tokens.textSecondary,
              fontSize: '0.85rem',
              fontWeight: 600,
              '&:hover': {
                borderColor: tokens.primary,
                color: tokens.primary,
                bgcolor: `${tokens.primary}10`,
              },
            }}
          >
            Share Meetup Link
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
