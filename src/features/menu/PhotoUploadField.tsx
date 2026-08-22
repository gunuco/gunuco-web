import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRef } from 'react';
import { brand } from '@/theme/colors';

export function PhotoUploadField({
  value,
  hue,
  onChange,
}: {
  value?: string;
  hue?: number;
  onChange: (dataUrl?: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  const pick = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  return (
    <Stack direction="row" gap={1.5} alignItems="center">
      <Box
        onClick={() => input.current?.click()}
        sx={{
          width: 96,
          height: 96,
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0,
          border: `1px dashed ${brand.line}`,
          bgcolor: value ? '#111' : hue != null ? `hsl(${hue} 38% 28%)` : alpha(brand.wine, 0.08),
          backgroundImage: value ? `url(${value})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': { borderColor: brand.wine },
        }}
      >
        {value ? null : <AddPhotoAlternateRoundedIcon sx={{ color: brand.goldDark }} />}
      </Box>
      <Stack gap={0.75}>
        <Typography fontWeight={800} fontSize={13}>
          Product photo
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Square image, shown on the customer preview. JPG or PNG.
        </Typography>
        <Stack direction="row" gap={1}>
          <Button size="small" variant="outlined" onClick={() => input.current?.click()}>
            Upload
          </Button>
          {value ? (
            <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => onChange(undefined)}>
              Remove
            </Button>
          ) : null}
        </Stack>
      </Stack>
      <input
        ref={input}
        hidden
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </Stack>
  );
}
