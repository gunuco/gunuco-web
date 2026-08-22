import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { MouseEvent } from 'react';
import type { ServicePin } from '@/store/fulfilmentStore';
import { brand } from '@/theme/colors';

const KM_PER_DEG_LAT = 111;

function bboxFor(lat: number, lng: number, viewKm: number) {
  const latPad = viewKm / KM_PER_DEG_LAT;
  const lngPad = viewKm / (KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  return {
    north: lat + latPad,
    south: lat - latPad,
    east: lng + lngPad,
    west: lng - lngPad,
  };
}

function embedSrc(lat: number, lng: number, viewKm: number) {
  const box = bboxFor(lat, lng, viewKm);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${box.west}%2C${box.south}%2C${box.east}%2C${box.north}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function CoverageMap({
  center,
  viewKm,
  pins,
  selectedId,
  onSelect,
  onDropPin,
}: {
  center: { lat: number; lng: number };
  viewKm: number;
  pins: ServicePin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDropPin: (lat: number, lng: number) => void;
}) {
  const box = bboxFor(center.lat, center.lng, viewKm);

  const project = (lat: number, lng: number) => {
    const x = ((lng - box.west) / (box.east - box.west)) * 100;
    const y = ((box.north - lat) / (box.north - box.south)) * 100;
    return { x, y };
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const lng = box.west + x * (box.east - box.west);
    const lat = box.north - y * (box.north - box.south);
    onDropPin(lat, lng);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        height: 380,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${brand.line}`,
        cursor: 'crosshair',
      }}
    >
      <Box
        component="iframe"
        title="Coverage map"
        src={embedSrc(center.lat, center.lng, viewKm)}
        sx={{ width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
      />
      {pins
        .filter((pin) => pin.active)
        .map((pin) => {
          const { x, y } = project(pin.lat, pin.lng);
          const size = Math.min(360, Math.max(36, (pin.radiusKm / viewKm) * 380));
          const selected = pin.id === selectedId;
          return (
            <Box key={pin.id} sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
              <Box
                sx={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? brand.wine : brand.gold}`,
                  bgcolor: alpha(selected ? brand.wine : brand.gold, 0.16),
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <PlaceRoundedIcon
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(pin.id);
                }}
                sx={{
                  fontSize: selected ? 34 : 28,
                  color: selected ? brand.wine : brand.goldDark,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              />
            </Box>
          );
        })}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          left: 10,
          bottom: 10,
          px: 1,
          py: 0.35,
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.9)',
          fontWeight: 700,
        }}
      >
        Click map to drop a coverage pin
      </Typography>
    </Box>
  );
}
