import { useState, useRef } from 'react';
import { type Control, type UseFormSetValue } from 'react-hook-form';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

import { TextInput, type ActivityFormData } from '../../../../shared';
import { tokens } from '../../../../theme';

export interface ActivityCoverImageFieldProps {
  control: Control<ActivityFormData>;
  setValue: UseFormSetValue<ActivityFormData>;
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  watchedImage?: string;
}

export default function ActivityCoverImageField({
  control,
  setValue,
  selectedImage,
  setSelectedImage,
  watchedImage,
}: ActivityCoverImageFieldProps) {
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndSetImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file (PNG, JPG, WebP).');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.82);
          setSelectedImage(optimized);
          setValue('image', optimized, { shouldDirty: true, shouldValidate: true });
        } else {
          setSelectedImage(rawDataUrl);
          setValue('image', rawDataUrl, { shouldDirty: true, shouldValidate: true });
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage('');
    setValue('image', '', { shouldDirty: true, shouldValidate: true });
    setFileName('');
  };

  const isDataUrl = selectedImage && selectedImage.startsWith('data:');

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: '16px',
        bgcolor: tokens.surface2,
        border: `1px solid ${tokens.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Header & Source Mode Selector */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon sx={{ color: tokens.primary, fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.2 }}>
              Event Cover Image
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.textMuted }}>
              Upload an image from your device or enter an image link
            </Typography>
          </Box>
        </Box>

        {/* Mode Switcher Buttons */}
        <Box
          sx={{
            display: 'inline-flex',
            p: 0.5,
            borderRadius: '10px',
            bgcolor: 'rgba(0,0,0,0.3)',
            border: `1px solid ${tokens.border}`,
            gap: 0.5,
          }}
        >
          <Button
            size="small"
            onClick={() => setImageInputMode('upload')}
            startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              color: imageInputMode === 'upload' ? '#000000' : tokens.textSecondary,
              bgcolor: imageInputMode === 'upload' ? tokens.primary : 'transparent',
              '&:hover': {
                bgcolor: imageInputMode === 'upload' ? '#4F46E5' : 'rgba(255,255,255,0.06)',
              },
            }}
          >
            Upload Photo
          </Button>
          <Button
            size="small"
            onClick={() => setImageInputMode('url')}
            startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              color: imageInputMode === 'url' ? '#000000' : tokens.textSecondary,
              bgcolor: imageInputMode === 'url' ? tokens.primary : 'transparent',
              '&:hover': {
                bgcolor: imageInputMode === 'url' ? '#4F46E5' : 'rgba(255,255,255,0.06)',
              },
            }}
          >
            Image URL
          </Button>
        </Box>
      </Box>

      {/* Mode 1: Drag & Drop File Upload */}
      {imageInputMode === 'upload' && (
        <Box>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp,image/jpg,image/svg+xml"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {isDataUrl ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(0,0,0,0.25)',
                border: `1px solid ${tokens.border}`,
                flexWrap: 'wrap',
              }}
            >
              <Box
                component="img"
                src={selectedImage}
                alt="Uploaded preview"
                sx={{
                  width: 120,
                  height: 75,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: `1px solid ${tokens.primary}50`,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
                  {fileName || 'Uploaded Cover Photo'}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.teal, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14 }} /> Ready to be saved with event
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    color: tokens.primary,
                    borderColor: tokens.primary,
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    '&:hover': { borderColor: '#4F46E5', bgcolor: `${tokens.primary}12` },
                  }}
                >
                  Change
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                  onClick={handleRemoveImage}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.78rem',
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${isDragging ? tokens.primary : tokens.primary + '55'}`,
                bgcolor: isDragging ? `${tokens.primary}15` : `${tokens.surface}88`,
                borderRadius: '14px',
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.2,
                '&:hover': {
                  borderColor: tokens.primary,
                  bgcolor: `${tokens.primary}10`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: `${tokens.primary}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.primary,
                }}
              >
                <AddPhotoAlternateIcon sx={{ fontSize: 28 }} />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
                  Click to browse or drag & drop event cover photo
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.textMuted }}>
                  PNG, JPG, WebP supported. Photo will be automatically optimized for rapid display.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon />}
                sx={{
                  mt: 0.5,
                  borderColor: tokens.primary,
                  color: tokens.primary,
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: '#4F46E5',
                    bgcolor: `${tokens.primary}15`,
                  },
                }}
              >
                Browse Local Files
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Mode 2: Direct Image URL */}
      {imageInputMode === 'url' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextInput
            control={control}
            name="image"
            label="Direct Image URL"
            placeholder="https://images.unsplash.com/photo-... or /images/..."
          />
          {watchedImage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
              <Box
                component="img"
                src={watchedImage}
                alt="URL preview"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                sx={{
                  width: 80,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: `1px solid ${tokens.border}`,
                }}
              />
              <Typography variant="caption" sx={{ color: tokens.textSecondary }}>
                Image URL preview loaded
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
