'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import { Box, Button, Grid, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { tokens } from '@/theme/tokens';

interface PhotoUploadWidgetProps {
  onUpload: (blob: Blob) => void;
  uploading: boolean;
}

export default function PhotoUploadWidget({ onUpload, uploading }: PhotoUploadWidgetProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const url = URL.createObjectURL(acceptedFiles[0]);
      setPreviewUrl(url);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const handleCropAndUpload = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob((blob) => {
      if (blob) onUpload(blob);
    }, 'image/jpeg');
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="overline" color={tokens.primaryLight} fontWeight={700}>
          Step 1 — Add photo
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            mt: 1,
            height: 260,
            borderRadius: '14px',
            border: `2px dashed ${isDragActive ? tokens.teal : tokens.borderHover}`,
            bgcolor: tokens.surface2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            cursor: 'pointer',
            textAlign: 'center',
            p: 2,
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 54, color: tokens.primaryLight }} />
          <Typography variant="body1" fontWeight={600}>
            {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="overline" color={tokens.primaryLight} fontWeight={700}>
          Step 2 — Resize image
        </Typography>
        <Box sx={{ mt: 1 }}>
          {previewUrl ? (
            <Cropper
              src={previewUrl}
              style={{ height: 260, width: '100%' }}
              initialAspectRatio={1}
              aspectRatio={1}
              preview=".img-preview"
              guides={false}
              viewMode={1}
              background={false}
              ref={cropperRef}
            />
          ) : (
            <Box
              sx={{
                height: 260,
                borderRadius: '14px',
                bgcolor: tokens.surface2,
                border: `1px solid ${tokens.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.textMuted,
              }}
            >
              Select a photo first
            </Box>
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="overline" color={tokens.primaryLight} fontWeight={700}>
          Step 3 — Preview & Upload
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            className="img-preview"
            sx={{
              width: 220,
              height: 220,
              overflow: 'hidden',
              borderRadius: '14px',
              bgcolor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
            }}
          />
          {previewUrl && (
            <Button
              variant="contained"
              fullWidth
              disabled={uploading}
              onClick={handleCropAndUpload}
            >
              {uploading ? 'Uploading to Cloudinary...' : 'Upload Photo'}
            </Button>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
