import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CodeIcon from '@mui/icons-material/Code';
import { tokens } from '../../../theme';
import type { HomeStats } from '../types';

export interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export interface StatsBarProps {
  stats?: HomeStats;
  items?: StatItem[];
}

export default function StatsBar({ stats, items }: StatsBarProps) {
  const displayStats: StatItem[] = items ?? [
    {
      icon: <GroupIcon sx={{ fontSize: 20, color: tokens.primary }} />,
      value: stats ? `+${stats.activeDevelopers.toLocaleString()}` : '+1,200',
      label: 'Active Developers',
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 20, color: tokens.accent }} />,
      value: stats ? `+${stats.totalEvents.toLocaleString()}` : '+340',
      label: 'Events Hosted',
    },
    {
      icon: <CodeIcon sx={{ fontSize: 20, color: tokens.teal }} />,
      value: stats ? `${stats.techTracks.toLocaleString()}` : '5',
      label: 'Tech Tracks',
    },
  ];

  return (
    <Box sx={{ borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}`, bgcolor: tokens.surface }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center', md: 'center' },
            flexWrap: 'wrap',
            gap: { xs: 4, md: 10 },
            py: 3,
          }}
        >
          {displayStats.map((s) => (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {s.icon}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: tokens.textPrimary, lineHeight: 1.2 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                  {s.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
