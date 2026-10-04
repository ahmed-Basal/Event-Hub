import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { tokens } from '../../../../theme';

export interface ActivityFormActionsProps {
  isPending: boolean;
  isEditMode: boolean;
  isValid: boolean;
  isDirty: boolean;
  onCancel: () => void;
}

export default function ActivityFormActions({
  isPending,
  isEditMode,
  isValid,
  isDirty,
  onCancel,
}: ActivityFormActionsProps) {
  const isSubmitDisabled = isPending || !isValid || (isEditMode && !isDirty);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        pt: 2,
        borderTop: `1px solid ${tokens.border}`,
      }}
    >
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={isPending}
        startIcon={<CancelIcon />}
        sx={{
          borderRadius: '12px',
          px: 3,
          py: 1.1,
          color: tokens.textSecondary,
          borderColor: tokens.border,
          fontWeight: 600,
          '&:hover': {
            borderColor: tokens.borderHover,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            color: tokens.textPrimary,
          },
        }}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitDisabled}
        startIcon={
          isPending ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SaveIcon />
          )
        }
        sx={{
          borderRadius: '12px',
          px: 4,
          py: 1.1,
          bgcolor: tokens.primary,
          color: tokens.bg,
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: tokens.shadowGold,
          '&:hover': {
            bgcolor: '#e08e0a',
          },
          '&:disabled': {
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            color: tokens.textMuted,
          },
        }}
      >
        {isPending
          ? 'Submitting...'
          : isEditMode
          ? 'Update Event'
          : 'Create Event'}
      </Button>
    </Box>
  );
}
