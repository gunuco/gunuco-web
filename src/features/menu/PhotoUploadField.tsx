import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRef } from 'react';
import { brand } from '@/theme/colors';

const MAX_PHOTOS = 8;

function readFile(file: File) {
  return new Promise<string | undefined>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

export function PhotoUploadField({
  values,
  hue,
  onChange,
}: {
  values: string[];
  hue?: number;
  onChange: (urls: string[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const remaining = MAX_PHOTOS - values.length;

  const pick = async (files: FileList | null) => {
    if (!files?.length || remaining <= 0) return;
    const chosen = Array.from(files).slice(0, remaining);
    const urls = (await Promise.all(chosen.map(readFile))).filter(Boolean) as string[];
    if (urls.length) onChange([...values, ...urls]);
    if (input.current) input.current.value = '';
  };

  return (
    <Stack gap={1.25}>
      <Stack gap={0.35}>
        <Typography fontWeight={800} fontSize={13}>
          Product photos
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Upload more than one image. The first photo is the cover. JPG, PNG or WebP, up to {MAX_PHOTOS}.
        </Typography>
      </Stack>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {values.map((url, index) => (
          <Box key={`${url.slice(0, 24)}-${index}`} sx={{ position: 'relative' }}>
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${index === 0 ? brand.wine : brand.line}`,
                bgcolor: '#111',
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <IconButton
              size="small"
              aria-label="Remove photo"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: brand.creamPaper,
                boxShadow: 1,
                '&:hover': { bgcolor: brand.cream },
              }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
            {index === 0 ? (
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'center', mt: 0.35, fontWeight: 800, color: brand.wine }}
              >
                Cover
              </Typography>
            ) : null}
          </Box>
        ))}
        {remaining > 0 ? (
          <Box
            onClick={() => input.current?.click()}
            sx={{
              width: 88,
              height: 88,
              borderRadius: 2,
              cursor: 'pointer',
              flexShrink: 0,
              border: `1px dashed ${brand.line}`,
              bgcolor: hue != null ? `hsl(${hue} 38% 28%)` : alpha(brand.wine, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { borderColor: brand.wine },
            }}
          >
            <AddPhotoAlternateRoundedIcon sx={{ color: brand.goldDark }} />
          </Box>
        ) : null}
      </Stack>
      <Button
        size="small"
        variant="outlined"
        disabled={remaining <= 0}
        onClick={() => input.current?.click()}
        sx={{ alignSelf: 'flex-start' }}
      >
        {values.length ? 'Add more photos' : 'Upload photos'}
      </Button>
      <input
        ref={input}
        hidden
        multiple
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => void pick(e.target.files)}
      />
    </Stack>
  );
}
