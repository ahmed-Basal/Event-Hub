import { useState, type FormEvent, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router';
import useactivites from '../../../lib/Hooks/useactivites';
import type { Activity } from '../../../lib/Types';
import { CATEGORY_OPTIONS, LEVEL_OPTIONS } from '../../../lib/schemas/activitySchema';
import Spinner from '../../../lib/components/Spinner';
import { tokens } from '../../../theme/theme';
import { GradientTag } from '../../../lib/UTlity/tagUtils';

const POPULAR_TAGS = [
  '.NET 9',
  'C#',
  'Microservices',
  'React',
  'Clean Architecture',
  'Docker',
  'PostgreSQL',
  'Next.js',
  'Cybersecurity',
  'DevOps',
  'AI / ML',
  'Cloud / Azure',
];

export default function ActivityForm() {
  const { id } = useParams<{ id: string }>();
  const { updateActivity, createActivity, activity, isLoadingActivity } = useactivites(id);
  const navigate = useNavigate();

  // Tags state
  const [tags, setTags] = useState<string[]>(activity?.tags ?? []);
  const [currentTagInput, setCurrentTagInput] = useState<string>('');

  const isSubmitting = updateActivity.isPending || createActivity.isPending;
  const closeForm = () => navigate('/activities');

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (!clean) return;
    if (!tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setCurrentTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(currentTagInput);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Use current tags state
    data.tags = tags;

    if (activity) {
      data.id = activity.id;
      await updateActivity.mutateAsync(data as unknown as Activity);
      closeForm();
    } else {
      createActivity.mutate(data as unknown as Activity, {
        onSuccess: (newId) => {
          navigate(`/activities/${newId}`);
        },
      });
    }
  };

  if (isLoadingActivity) {
    return <Spinner message="Loading meetup details..." minHeight={340} />;
  }

  // Modern dark input styling
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      backgroundColor: tokens.surface2,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '& fieldset': {
        borderColor: tokens.border,
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: tokens.borderHover,
      },
      '&.Mui-focused fieldset': {
        borderColor: tokens.primary,
        borderWidth: '1.5px',
      },
    },
    '& .MuiInputLabel-root': {
      color: tokens.textSecondary,
      '&.Mui-focused': {
        color: tokens.primary,
      },
    },
    '& .MuiInputBase-input': {
      color: tokens.textPrimary,
      fontSize: '0.95rem',
    },
    '& .MuiFormHelperText-root': {
      color: tokens.textMuted,
      fontSize: '0.78rem',
      mt: 0.8,
    },
  };

  return (
    <Box sx={{ maxWidth: 840, mx: 'auto', mb: 8, mt: 1 }}>
      {/* ── Breadcrumb / Back Link ── */}
      <Button
        onClick={closeForm}
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        sx={{
          color: tokens.textSecondary,
          mb: 2.5,
          px: 1.5,
          py: 0.6,
          borderRadius: '10px',
          fontSize: '0.85rem',
          '&:hover': {
            color: tokens.textPrimary,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
      >
        Back to Meetups
      </Button>

      {/* ── Main Form Surface ── */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          borderRadius: '24px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadowCard,
          p: { xs: 2.5, sm: 4.5 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent}, ${tokens.teal})`,
          },
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              bgcolor: `${tokens.primary}18`,
              border: `1px solid ${tokens.primary}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.primary,
              boxShadow: tokens.shadowGold,
              flexShrink: 0,
            }}
          >
            {activity ? (
              <EditNoteIcon sx={{ fontSize: 30 }} />
            ) : (
              <AddCircleIcon sx={{ fontSize: 28 }} />
            )}
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: tokens.textPrimary,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {activity ? 'Edit Tech Meetup' : 'Create New Tech Meetup'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: tokens.textSecondary,
                mt: 0.5,
              }}
            >
              {activity
                ? 'Update the agenda, speakers, topics, and logistics for this event.'
                : 'Publish an upcoming session, hands-on workshop, or community summit.'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: tokens.border, mb: 3.5 }} />

        {/* ── Form ── */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3.2 }}
        >
          {/* 1. Title */}
          <TextField
            name="title"
            label="Event Title"
            required
            placeholder="e.g. Cairo .NET 9 & Microservices Summit"
            defaultValue={activity?.title ?? ''}
            fullWidth
            sx={fieldSx}
          />

          {/* 2. Category & Level Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            <TextField
              select
              name="category"
              label="Technical Track"
              defaultValue={activity?.category ?? 'BackEnd'}
              fullWidth
              sx={fieldSx}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              name="level"
              label="Audience Level"
              defaultValue={activity?.level ?? 'All Levels'}
              fullWidth
              sx={fieldSx}
            >
              {LEVEL_OPTIONS.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>
                  {lvl}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* 3. Description */}
          <TextField
            name="description"
            label="Detailed Agenda & Overview"
            required
            placeholder="Describe the key takeaways, speakers, prerequisites, and what developers will build or learn..."
            defaultValue={activity?.description ?? ''}
            multiline
            rows={4}
            fullWidth
            sx={{
              ...fieldSx,
              '& .MuiOutlinedInput-root': {
                ...fieldSx['& .MuiOutlinedInput-root'],
                borderRadius: '16px',
              },
            }}
          />

          {/* 4. Interactive Tags Manager */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOfferIcon sx={{ fontSize: 18, color: tokens.primary }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
                Topics &amp; Tech Stack Tags
              </Typography>
            </Box>

            {/* Tag input row */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                label="Add a topic (type & press Enter)"
                placeholder="e.g. Docker, GraphQL, Redis..."
                value={currentTagInput}
                onChange={(e) => setCurrentTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                fullWidth
                sx={fieldSx}
              />
              <Button
                type="button"
                variant="outlined"
                onClick={() => handleAddTag(currentTagInput)}
                disabled={!currentTagInput.trim()}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: '14px',
                  px: 2.8,
                  borderColor: tokens.border,
                  color: tokens.primary,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: tokens.primary,
                    bgcolor: `${tokens.primary}12`,
                  },
                }}
              >
                Add Tag
              </Button>
            </Box>

            {/* Selected Tags Chips */}
            {tags.length > 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: tokens.surface3,
                  border: `1px solid ${tokens.border}`,
                }}
              >
                {tags.map((tag, idx) => (
                  <GradientTag
                    key={tag}
                    tag={tag}
                    index={idx}
                    fontSize="0.8rem"
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: tokens.textMuted }}>
                No tags added yet. Choose from popular topics below or type your own.
              </Typography>
            )}

            {/* Recommended Quick-Pick Tags */}
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: tokens.textMuted, display: 'block', mb: 1 }}>
                Suggested Topics:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {POPULAR_TAGS.map((recTag) => {
                  const isSelected = tags.includes(recTag);
                  return (
                    <Chip
                      key={recTag}
                      label={recTag}
                      size="small"
                      clickable
                      onClick={() =>
                        isSelected ? handleRemoveTag(recTag) : handleAddTag(recTag)
                      }
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: isSelected ? `${tokens.primary}22` : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? tokens.primary : tokens.textSecondary,
                        border: `1px solid ${
                          isSelected ? `${tokens.primary}60` : tokens.border
                        }`,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: isSelected
                            ? `${tokens.primary}33`
                            : 'rgba(255, 255, 255, 0.08)',
                          borderColor: tokens.primary,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* 5. Date & Schedule */}
          <TextField
            name="date"
            type="date"
            label="Event Date"
            required
            slotProps={{ inputLabel: { shrink: true } }}
            defaultValue={activity?.date ? activity.date.split('T')[0] : ''}
            fullWidth
            sx={{
              ...fieldSx,
              '& input[type="date"]': {
                colorScheme: 'dark',
              },
            }}
          />

          {/* 6. Location: City & Venue */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            <TextField
              name="city"
              label="City"
              required
              placeholder="e.g. Cairo, Alexandria, Giza, Assiut"
              defaultValue={activity?.city ?? ''}
              fullWidth
              sx={fieldSx}
            />

            <TextField
              name="venue"
              label="Venue / Address"
              required
              placeholder="e.g. The GrEEK Campus, Downtown Cairo"
              defaultValue={activity?.venue ?? ''}
              fullWidth
              sx={fieldSx}
            />
          </Box>

          <Divider sx={{ borderColor: tokens.border, my: 1 }} />

          {/* ── Action Buttons ── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Button
              onClick={closeForm}
              disabled={isSubmitting}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.1,
                color: tokens.textSecondary,
                border: `1px solid ${tokens.border}`,
                fontSize: '0.9rem',
                fontWeight: 600,
                '&:hover': {
                  color: tokens.textPrimary,
                  borderColor: tokens.borderHover,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? undefined : activity ? (
                  <SaveIcon />
                ) : (
                  <RocketLaunchIcon />
                )
              }
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.2,
                fontSize: '0.92rem',
                fontWeight: 700,
                bgcolor: tokens.primary,
                color: tokens.bg,
                boxShadow: tokens.shadowGold,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#e08e0a',
                  boxShadow: '0px 12px 36px 0px rgba(245, 158, 11, 0.38)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {isSubmitting
                ? activity
                  ? 'Saving changes...'
                  : 'Publishing meetup...'
                : activity
                ? 'Save Changes'
                : 'Publish Meetup'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
