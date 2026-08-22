import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import type { DeliveryPartner, Order } from '@/types';

const STORE = { lat: 16.5062, lng: 80.648 };

export function dropCoords(address: string) {
  let hash = 0;
  for (let i = 0; i < address.length; i += 1) hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  return {
    lat: STORE.lat + ((hash % 90) - 45) / 900,
    lng: STORE.lng + (((hash / 90) | 0) % 90 - 45) / 900,
  };
}

function embedSrc(lat: number, lng: number) {
  const pad = 0.018;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad}%2C${lat - pad}%2C${lng + pad}%2C${lat + pad}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function RiderGpsDialog({
  rider,
  order,
  onClose,
}: {
  rider: DeliveryPartner | null;
  order?: Order | null;
  onClose: () => void;
}) {
  const lat = rider?.lat ?? STORE.lat;
  const lng = rider?.lng ?? STORE.lng;
  const drop = order ? dropCoords(order.customerAddress) : null;

  return (
    <Dialog open={Boolean(rider)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
        {rider ? `${rider.name} · live GPS` : 'GPS'}
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="Close">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {rider ? (
          <Stack gap={1.5}>
            <Typography variant="body2" color="text.secondary">
              Last ping: {rider.locationLabel} · {lat.toFixed(5)}, {lng.toFixed(5)}
            </Typography>
            {order ? (
              <Typography variant="body2">
                Drop {order.orderNumber}: {order.customerAddress}
                {drop ? ` · ${drop.lat.toFixed(5)}, ${drop.lng.toFixed(5)}` : ''}
              </Typography>
            ) : null}
            <Box
              component="iframe"
              title="Rider GPS map"
              src={embedSrc(lat, lng)}
              sx={{ width: '100%', height: 420, border: 0, borderRadius: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              Map marker is the delivery partner. Open OSM in a new tab for street-level zoom.
            </Typography>
            <Typography
              component="a"
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
              target="_blank"
              rel="noreferrer"
              variant="body2"
              sx={{ fontWeight: 700 }}
            >
              Open full map
            </Typography>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
