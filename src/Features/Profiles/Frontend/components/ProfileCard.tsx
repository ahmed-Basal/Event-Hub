'use client';

import Link from 'next/link';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { tokens } from '@/theme/tokens';

interface ProfileCardProps {
  username: string;
  displayName: string;
  bio?: string | null;
  image?: string | null;
  following?: boolean;
  followersCount?: number;
}

export default function ProfileCard({
  username,
  displayName,
  bio,
  image,
  following,
  followersCount = 0,
}: ProfileCardProps) {
  return (
    <Card
      component={Link}
      href={`/profiles/${username}`}
      sx={{
        display: 'block',
        textDecoration: 'none',
        borderRadius: '14px',
        p: 2,
        width: 240,
        bgcolor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        transition: 'border-color 0.2s, transform 0.2s',
        '&:hover': {
          borderColor: tokens.borderHover,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
        <Avatar
          src={image || '/images/user.png'}
          alt={displayName}
          sx={{
            width: 88,
            height: 88,
            border: `2px solid ${following ? tokens.teal : tokens.primary}`,
          }}
        />
      </Box>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {displayName}
          </Typography>
          {bio && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {bio}
            </Typography>
          )}
          {following && (
            <Chip
              size="small"
              label="Following"
              sx={{
                bgcolor: `${tokens.teal}22`,
                color: tokens.teal,
                border: `1px solid ${tokens.teal}55`,
              }}
            />
          )}
        </Box>
      </CardContent>
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, color: tokens.textSecondary }}>
        <PersonIcon sx={{ fontSize: 18 }} />
        <Typography variant="caption" fontWeight={600}>
          {followersCount} {followersCount === 1 ? 'Follower' : 'Followers'}
        </Typography>
      </Box>
    </Card>
  );
}
