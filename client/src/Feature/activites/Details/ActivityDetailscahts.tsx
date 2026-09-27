import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ForumIcon from '@mui/icons-material/Forum';
import SendIcon from '@mui/icons-material/Send';
import { Link } from 'react-router';
import { tokens } from '../../../theme/theme';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  date: string;
  body: string;
  isSpeaker?: boolean;
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: '1',
    author: 'Tarek Mostafa',
    avatar: '/images/user.png',
    date: '2 hours ago',
    body: 'Looking forward to this session! Will the practical code samples and architectural diagrams be shared on GitHub after the meetup?',
  },
  {
    id: '2',
    author: 'Bob (Organizer)',
    avatar: '/images/user.png',
    date: '45 mins ago',
    body: 'Absolutely! The entire repository with .NET 9 minimal APIs and Docker Compose setups will be provided with full documentation.',
    isSpeaker: true,
  },
];

export default function ActivityDetailsChat() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      avatar: '/images/user.png',
      date: 'Just now',
      body: commentText.trim(),
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  return (
    <Card
      sx={{
        borderRadius: '20px',
        bgcolor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.shadowCard,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.5, sm: 3.5 },
          py: 2.2,
          borderBottom: `1px solid ${tokens.border}`,
          bgcolor: tokens.surface2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: `${tokens.primary}18`,
              border: `1px solid ${tokens.primary}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.primary,
            }}
          >
            <ForumIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
              Community Discussion
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.textMuted }}>
              Ask questions to the host or connect with attendees
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`${comments.length} Comments`}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.06)',
            color: tokens.textSecondary,
            fontWeight: 600,
            fontSize: '0.75rem',
            border: `1px solid ${tokens.border}`,
          }}
        />
      </Box>

      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* ── Add Comment Form ── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Avatar
            src="/images/user.png"
            alt="Current user"
            sx={{
              width: 42,
              height: 42,
              border: `1.5px solid ${tokens.primary}`,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              placeholder="Ask a question or leave a thought for the community..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  backgroundColor: tokens.surface2,
                  transition: 'border-color 0.2s',
                  '& fieldset': { borderColor: tokens.border },
                  '&:hover fieldset': { borderColor: tokens.borderHover },
                  '&.Mui-focused fieldset': { borderColor: tokens.primary },
                },
                '& .MuiInputBase-input': {
                  color: tokens.textPrimary,
                  fontSize: '0.92rem',
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: tokens.textMuted }}>
                Tip: Press <Box component="span" sx={{ color: tokens.primary, fontWeight: 700 }}>Enter</Box> to submit, <Box component="span" sx={{ color: tokens.textSecondary }}>Shift+Enter</Box> for new line.
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                endIcon={<SendIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '10px',
                  px: 3,
                  py: 0.8,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  bgcolor: tokens.primary,
                  color: tokens.bg,
                  boxShadow: tokens.shadowGold,
                  '&:hover': {
                    bgcolor: '#e08e0a',
                  },
                }}
              >
                Post Comment
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: tokens.border, mb: 3 }} />

        {/* ── Comments List ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {comments.map((comment) => (
            <Box
              key={comment.id}
              sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: '14px',
                bgcolor: tokens.surface2,
                border: `1px solid ${tokens.border}`,
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  borderColor: tokens.borderHover,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Avatar
                src={comment.avatar}
                alt={comment.author}
                sx={{
                  width: 38,
                  height: 38,
                  border: `1.5px solid ${comment.isSpeaker ? tokens.primary : tokens.border}`,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                  <Typography
                    component={Link}
                    to="/profiles/bob"
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: tokens.textPrimary,
                      textDecoration: 'none',
                      '&:hover': { color: tokens.primary },
                    }}
                  >
                    {comment.author}
                  </Typography>

                  {comment.isSpeaker && (
                    <Chip
                      label="Host"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: `${tokens.primary}22`,
                        color: tokens.primary,
                        border: `1px solid ${tokens.primary}44`,
                      }}
                    />
                  )}

                  <Typography variant="caption" sx={{ color: tokens.textMuted }}>
                    {comment.date}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: tokens.textSecondary,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {comment.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
