'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { Avatar, Popover } from '@mui/material';
import type { Attendee } from '@features/Activities/Frontend';
import { tokens } from '@/theme/tokens';
import ProfileCard from './ProfileCard';

export default function AvatarPopover({ attendee }: { attendee: Attendee }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Avatar
        component={Link}
        href={`/profiles/${attendee.username}`}
        src={attendee.image || '/images/user.png'}
        alt={attendee.displayName}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        sx={{
          width: 36,
          height: 36,
          border: attendee.following
            ? `2.5px solid ${tokens.teal}`
            : `1.5px solid ${tokens.border}`,
          cursor: 'pointer',
        }}
      />
      <Popover
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={handleClose}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: { bgcolor: 'transparent', boxShadow: 'none', border: 'none' },
          },
        }}
      >
        <ProfileCard
          username={attendee.username}
          displayName={attendee.displayName}
          bio={attendee.bio}
          image={attendee.image}
          following={attendee.following}
          followersCount={attendee.followersCount}
        />
      </Popover>
    </>
  );
}
