import { Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { APP_CONFIG } from '@/config/app.config';
import { ROLE_LABELS } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <Stack gap={2.5} maxWidth={640}>
      <PageHeader eyebrow="Workspace" title="Settings" subtitle="Profile, tax and mock API flags. Real secrets stay on the server." />
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Signed-in user
          </Typography>
          <Stack gap={2}>
            <TextField label="Name" value={user?.name ?? ''} InputProps={{ readOnly: true }} />
            <TextField label="Email" value={user?.email ?? ''} InputProps={{ readOnly: true }} />
            <TextField select label="Role" value={user?.role ?? 'owner'} InputProps={{ readOnly: true }}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Commerce
          </Typography>
          <Stack gap={2}>
            <TextField label="Currency" value={APP_CONFIG.currency} InputProps={{ readOnly: true }} />
            <TextField label="Default location" value={APP_CONFIG.locationName} InputProps={{ readOnly: true }} />
            <TextField label="GST rate" value={`${APP_CONFIG.taxRate * 100}%`} InputProps={{ readOnly: true }} />
            <TextField label="Max doorstep" value={`${APP_CONFIG.maxDoorstepKm} km`} InputProps={{ readOnly: true }} />
            <TextField
              label="API"
              value={import.meta.env.VITE_USE_MOCK !== 'false' ? 'Mock adapter (in-memory)' : import.meta.env.VITE_API_BASE_URL}
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
