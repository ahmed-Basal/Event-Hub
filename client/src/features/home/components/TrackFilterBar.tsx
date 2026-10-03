import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';
import AppsIcon from '@mui/icons-material/Apps';
import { tokens } from '../../../theme';

export interface TrackFilterBarProps {
  selectedTrack: string;
  onSelectTrack: (track: string) => void;
}

export const TRACKS = [
  {
    id: 'all',
    label: 'All Tracks',
    sublabel: 'Full Community',
    icon: <AppsIcon sx={{ fontSize: 20 }} />,
    color: tokens.primary,
  },
  {
    id: 'backend',
    label: 'BackEnd',
    sublabel: '.NET, Go & System Architecture',
    icon: <StorageIcon sx={{ fontSize: 20 }} />,
    color: tokens.teal,
  },
  {
    id: 'frontend',
    label: 'FrontEnd',
    sublabel: 'React, Next.js & Web Craft',
    icon: <CodeIcon sx={{ fontSize: 20 }} />,
    color: '#a78bfa',
  },
  {
    id: 'devops',
    label: 'DevOps & Cloud',
    sublabel: 'Docker, K8s & Infrastructure',
    icon: <CloudSyncIcon sx={{ fontSize: 20 }} />,
    color: tokens.primary,
  },
  {
    id: 'cybersecurity',
    label: 'CyberSecurity',
    sublabel: 'Red Team & Application Sec',
    icon: <SecurityIcon sx={{ fontSize: 20 }} />,
    color: '#4ade80',
  },
  {
    id: 'dataanalysis',
    label: 'Data & AI',
    sublabel: 'Machine Learning & Analytics',
    icon: <BarChartIcon sx={{ fontSize: 20 }} />,
    color: tokens.accent,
  },
];

export default function TrackFilterBar({ selectedTrack, onSelectTrack }: TrackFilterBarProps) {
  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
        bgcolor: tokens.surface,
        borderTop: `1px solid ${tokens.border}`,
        borderBottom: `1px solid ${tokens.border}`,
        position: 'relative',
      }}
    >
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: tokens.primary,
              textTransform: 'uppercase',
              mb: 0.5,
            }}
          >
            INTERACTIVE CONFERENCE TRACKS
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              color: tokens.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            Explore by Technical Domain
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.textSecondary, mt: 0.5 }}>
            Click on any engineering track to filter upcoming meetups and workshops in real time.
          </Typography>
        </Box>

        {/* Interactive Track Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              lg: 'repeat(6, 1fr)',
            },
            gap: 2,
          }}
        >
          {TRACKS.map((t) => {
            const isSelected = selectedTrack.toLowerCase() === t.id.toLowerCase();
            return (
              <Box
                key={t.id}
                onClick={() => onSelectTrack(t.id)}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? t.color : tokens.border}`,
                  bgcolor: isSelected ? `${t.color}14` : 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected ? `0 0 20px ${t.color}35` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  '&:hover': {
                    borderColor: t.color,
                    bgcolor: `${t.color}0a`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 24px ${t.color}25`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isSelected ? `${t.color}25` : 'rgba(255, 255, 255, 0.04)',
                    color: t.color,
                    border: `1px solid ${t.color}35`,
                  }}
                >
                  {t.icon}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: isSelected ? '#ffffff' : tokens.textPrimary,
                      lineHeight: 1.2,
                    }}
                  >
                    {t.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      color: tokens.textMuted,
                      mt: 0.3,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {t.sublabel}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
