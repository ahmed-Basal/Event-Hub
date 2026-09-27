import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { tokens } from '../../theme/theme';

interface ServerErrorPayload {
  statusCode?: number;
  message?: string;
  details?: string;
  traceId?: string;
  path?: string;
  method?: string;
  timestamp?: string;
}

export default function ServerError() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 1. Recover error from state or fallback to sessionStorage
  const [errorData, setErrorData] = useState<ServerErrorPayload | null>(() => {
    if (state?.error) return state.error;
    try {
      const saved = sessionStorage.getItem('lastServerError');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [copiedTrace, setCopiedTrace] = useState(false);
  const [copiedStack, setCopiedStack] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [filterAppOnly, setFilterAppOnly] = useState(true);

  const handleCopyTrace = () => {
    if (!errorData?.traceId) return;
    navigator.clipboard.writeText(errorData.traceId);
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  const handleCopyStack = () => {
    if (!errorData?.details) return;
    navigator.clipboard.writeText(errorData.details);
    setCopiedStack(true);
    setTimeout(() => setCopiedStack(false), 2000);
  };

  const handleCopyMarkdown = () => {
    if (!errorData) return;
    const md = [
      `### [Bug Report] 500 Internal Server Error`,
      `- **Path**: \`${errorData.method || 'GET'} ${errorData.path || '/unknown'}\``,
      `- **Trace ID**: \`${errorData.traceId || 'N/A'}\``,
      `- **Timestamp**: \`${errorData.timestamp || new Date().toISOString()}\``,
      `- **Message**: ${errorData.message || 'Server Exception'}`,
      `- **User Agent**: \`${navigator.userAgent}\``,
      ``,
      `<details>`,
      `<summary>Stack Trace</summary>`,
      ``,
      `\`\`\`text`,
      errorData.details || 'No stack trace available',
      `\`\`\``,
      `</details>`,
    ].join('\n');

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!errorData) return;
    const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-report-${errorData.traceId || Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSession = () => {
    try {
      sessionStorage.removeItem('lastServerError');
    } catch {
      // Ignore
    }
    setErrorData(null);
  };

  // 2. Parse and highlight application frames vs framework frames
  const stackFrames = useMemo(() => {
    if (!errorData?.details) return [];
    return errorData.details
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const isAppCode =
          line.includes('API.') ||
          line.includes('Application.') ||
          line.includes('Domain.') ||
          line.includes('Persistence.');
        return { id: idx, line, isAppCode };
      });
  }, [errorData?.details]);

  const displayedFrames = useMemo(() => {
    if (!filterAppOnly) return stackFrames;
    const filtered = stackFrames.filter(f => f.isAppCode);
    return filtered.length > 0 ? filtered : stackFrames;
  }, [stackFrames, filterAppOnly]);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
      {/* Top Banner Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ef4444, #f97316)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '16px',
              bgcolor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              flexShrink: 0,
            }}
          >
            <ErrorOutlinedIcon sx={{ fontSize: 36 }} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
              <Chip
                label={`HTTP ${errorData?.statusCode || 500}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(239, 68, 68, 0.18)',
                  color: '#fca5a5',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              />
              {errorData?.method && (
                <Chip
                  label={errorData.method}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    color: tokens.primary,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                />
              )}
              {errorData?.path && (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: tokens.textSecondary,
                    bgcolor: tokens.surface2,
                    px: 1,
                    py: 0.3,
                    borderRadius: '4px',
                    border: `1px solid ${tokens.border}`,
                  }}
                >
                  {errorData.path}
                </Typography>
              )}
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: tokens.textPrimary, mb: 1 }}>
              {errorData?.message || 'Internal Server Error'}
            </Typography>

            <Typography variant="body2" sx={{ color: tokens.textSecondary, maxWidth: 750 }}>
              An unhandled exception occurred while processing this request. The incident telemetry has been captured.
            </Typography>
          </Box>
        </Box>

        {/* Telemetry & Correlation ID Bar */}
        {errorData?.traceId && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: '12px',
              bgcolor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: tokens.textSecondary, textTransform: 'uppercase' }}>
                Correlation ID:
              </Typography>
              <Typography
                variant="body2"
                component="code"
                sx={{
                  fontFamily: 'monospace',
                  color: tokens.primary,
                  bgcolor: 'rgba(99, 102, 241, 0.12)',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                {errorData.traceId}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={copiedTrace ? 'Copied!' : 'Copy Correlation ID'}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopyTrace}
                  startIcon={copiedTrace ? <CheckIcon sx={{ color: '#4ade80' }} /> : <ContentCopyIcon />}
                  sx={{
                    color: copiedTrace ? '#4ade80' : tokens.textPrimary,
                    borderColor: tokens.border,
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: tokens.primary,
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                    },
                  }}
                >
                  {copiedTrace ? 'Copied ID' : 'Copy Trace ID'}
                </Button>
              </Tooltip>

              <Tooltip title={copiedMarkdown ? 'Copied Markdown!' : 'Copy Jira / GitHub Markdown Bug Report'}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopyMarkdown}
                  startIcon={copiedMarkdown ? <CheckIcon sx={{ color: '#4ade80' }} /> : <ContentCopyIcon />}
                  sx={{
                    color: copiedMarkdown ? '#4ade80' : tokens.textSecondary,
                    borderColor: tokens.border,
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: tokens.textPrimary,
                      color: tokens.textPrimary,
                    },
                  }}
                >
                  {copiedMarkdown ? 'Copied Markdown' : 'Copy Bug Report'}
                </Button>
              </Tooltip>

              <Tooltip title="Download JSON Diagnostic File">
                <IconButton
                  size="small"
                  onClick={handleDownloadJson}
                  sx={{
                    color: tokens.textSecondary,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '8px',
                    '&:hover': { color: tokens.textPrimary, borderColor: tokens.textPrimary },
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: 3.5 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/activities')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Back to Activities
            </Button>

            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: tokens.border,
                color: tokens.textPrimary,
                '&:hover': {
                  borderColor: tokens.primary,
                },
              }}
            >
              Go to Home
            </Button>

            <Button
              variant="text"
              startIcon={<RefreshIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                color: tokens.textSecondary,
                '&:hover': {
                  color: tokens.textPrimary,
                },
              }}
            >
              Retry Last Action
            </Button>
          </Box>

          {errorData && (
            <Button
              size="small"
              variant="text"
              startIcon={<DeleteOutlinedIcon />}
              onClick={handleClearSession}
              sx={{
                color: tokens.textSecondary,
                textTransform: 'none',
                fontSize: '0.8rem',
                '&:hover': { color: '#f87171' },
              }}
            >
              Dismiss Error
            </Button>
          )}
        </Box>
      </Paper>

      {/* Fallback Notice when page is directly visited without any error */}
      {!errorData && (
        <Alert
          severity="info"
          sx={{
            borderRadius: '14px',
            bgcolor: tokens.surface2,
            border: `1px solid ${tokens.border}`,
            color: tokens.textPrimary,
            mb: 4,
          }}
        >
          No active server error was recorded in this session. If you experienced an issue, try reproducing it from the activities page.
        </Alert>
      )}

      {/* Senior Stack Trace Accordion (Development Mode) */}
      {errorData?.details && (
        <Accordion
          defaultExpanded
          sx={{
            bgcolor: tokens.surface,
            border: `1px solid ${tokens.border}`,
            borderRadius: '16px !important',
            overflow: 'hidden',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: tokens.textSecondary }} />}
            sx={{
              px: 3,
              py: 1,
              bgcolor: tokens.surface2,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BugReportIcon sx={{ color: '#f87171', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
                  Exception Stack Trace (Diagnostics)
                </Typography>
              </Box>

              <Chip
                label={`${stackFrames.length} frames`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  color: tokens.textSecondary,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            {/* Toolbar inside Stack Trace */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                borderBottom: `1px solid ${tokens.border}`,
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={filterAppOnly}
                    onChange={e => setFilterAppOnly(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: tokens.textSecondary, fontWeight: 600 }}>
                    Highlight Application Code Only
                  </Typography>
                }
              />

              <Tooltip title={copiedStack ? 'Copied Full Stack Trace!' : 'Copy Raw Stack Trace'}>
                <Button
                  size="small"
                  onClick={handleCopyStack}
                  startIcon={copiedStack ? <CheckIcon sx={{ color: '#4ade80' }} /> : <ContentCopyIcon />}
                  sx={{
                    color: copiedStack ? '#4ade80' : tokens.textSecondary,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    '&:hover': { color: tokens.textPrimary },
                  }}
                >
                  {copiedStack ? 'Copied Stack' : 'Copy Stack'}
                </Button>
              </Tooltip>
            </Box>

            {/* Formatted Code Block */}
            <Box
              sx={{
                m: 0,
                p: 2.5,
                maxHeight: 520,
                overflowY: 'auto',
                overflowX: 'auto',
                bgcolor: '#0a0d14',
                fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: tokens.border,
                  borderRadius: '4px',
                },
              }}
            >
              {displayedFrames.map(frame => (
                <Box
                  key={frame.id}
                  sx={{
                    py: 0.3,
                    px: 1,
                    borderRadius: '4px',
                    bgcolor: frame.isAppCode ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    borderLeft: frame.isAppCode ? `3px solid ${tokens.primary}` : '3px solid transparent',
                    color: frame.isAppCode ? '#f8fafc' : '#64748b',
                    fontWeight: frame.isAppCode ? 600 : 400,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {frame.line}
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Container>
  );
}
