'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import {
  Forum as ForumIcon,
  Send as SendIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { tokens } from '@/theme/tokens';
import { useComments } from '@modules/comments';
import { useAccount } from '@modules/identity';

interface ActivityDetailsChatProps {
  activityId: string;
  hostUsername?: string | null;
}

export default function ActivityDetailsChat({
  activityId,
  hostUsername,
}: ActivityDetailsChatProps) {
  const { isLoggedIn, currentUser } = useAccount();
  const { comments, isConnected, isSending, sendComment } = useComments(activityId, isLoggedIn);
  const [body, setBody] = useState('');

  const handleSubmit = async () => {
    if (!body.trim()) return;
    await sendComment(body);
    setBody('');
  };

  return (
    <Card sx={{ borderRadius: '16px', overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: tokens.surface2,
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ForumIcon sx={{ color: tokens.primaryLight }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Chat about this event
          </Typography>
        </Box>
        <Chip
          size="small"
          icon={
            <DotIcon
              sx={{
                fontSize: '10px !important',
                color: `${isConnected ? tokens.teal : tokens.textMuted} !important`,
              }}
            />
          }
          label={isConnected ? 'SignalR Live' : isLoggedIn ? 'Connecting...' : 'Sign in to chat'}
          sx={{
            bgcolor: isConnected ? `${tokens.teal}1a` : 'rgba(255,255,255,0.05)',
            color: isConnected ? tokens.teal : tokens.textSecondary,
            border: `1px solid ${isConnected ? `${tokens.teal}44` : tokens.border}`,
          }}
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        {isLoggedIn ? (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Avatar
              src={currentUser?.image || '/images/user.png'}
              alt={currentUser?.displayName || 'You'}
              sx={{ width: 40, height: 40, border: `1.5px solid ${tokens.primary}` }}
            />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Enter your comment (Enter to submit, Shift + Enter for new line)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<SendIcon sx={{ fontSize: 16 }} />}
                  disabled={!body.trim() || isSending || !isConnected}
                  onClick={handleSubmit}
                >
                  {isSending ? 'Sending...' : 'Post Comment'}
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: '12px',
              bgcolor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <Box
                component={Link}
                href="/login"
                sx={{ color: tokens.primaryLight, fontWeight: 700, textDecoration: 'none' }}
              >
                Sign in
              </Box>{' '}
              to join the live SignalR discussion.
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 2.5 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No comments yet. Start the conversation!
            </Typography>
          ) : (
            comments.map((comment) => {
              const isHost = comment.username === hostUsername;
              return (
                <Box
                  key={comment.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: tokens.surface2,
                    border: `1px solid ${tokens.border}`,
                  }}
                >
                  <Avatar
                    component={Link}
                    href={`/profiles/${comment.username}`}
                    src={comment.image || '/images/user.png'}
                    alt={comment.displayName}
                    sx={{
                      width: 38,
                      height: 38,
                      border: `1.5px solid ${isHost ? tokens.primary : tokens.border}`,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        component={Link}
                        href={`/profiles/${comment.username}`}
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{
                          color: tokens.textPrimary,
                          textDecoration: 'none',
                          '&:hover': { color: tokens.primaryLight },
                        }}
                      >
                        {comment.displayName}
                      </Typography>
                      {isHost && (
                        <Chip
                          size="small"
                          label="Host"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            bgcolor: `${tokens.primary}22`,
                            color: tokens.primaryLight,
                          }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.body}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
