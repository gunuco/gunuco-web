import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { APP_CONFIG } from '@/config/app.config';
import { useUpdateDashboardControls } from '@/hooks/useDashboard';
import type { Category, FulfillmentMode, OrderControlSettings } from '@/types';
import { getChildCategories, getParentCategories } from '@/utils/category';
import { canEditGlobalControls, canMutateOrders } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

interface Props {
  settings?: OrderControlSettings;
  categories: Category[];
  loading?: boolean;
}

export function OrderControlPanel({ settings, categories, loading }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canMutateOrders(role) : false;
  const ownerOnly = role ? canEditGlobalControls(role) : false;
  const mutation = useUpdateDashboardControls();
  const parents = getParentCategories(categories).filter((c) => c.active);
  const cake = categories.find((c) => c.code === 'CAKES');
  const cakeChildren = cake ? getChildCategories(categories, cake.id).filter((c) => c.active) : [];

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Intake
            </Typography>
            <Typography variant="h6">Order controls</Typography>
            <Typography variant="body2" color="text.secondary">
              Global pause, acceptance mode and daily limits. Quota resets at midnight ({APP_CONFIG.timezone}).
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={settings?.acceptOrders ?? false}
                disabled={!ownerOnly || loading || mutation.isPending}
                onChange={(_, checked) => mutation.mutate({ acceptOrders: checked })}
              />
            }
            label={settings?.acceptOrders ? 'Accepting orders' : 'Orders paused'}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} sx={{ mb: 2 }}>
          <TextField
            select
            label="Delivery assignment"
            value={settings?.deliveryAssignmentMode ?? 'manual'}
            disabled={!canEdit}
            onChange={(e) => mutation.mutate({ deliveryAssignmentMode: e.target.value as FulfillmentMode })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="auto">Automatic</MenuItem>
            <MenuItem value="manual">Manual</MenuItem>
          </TextField>
          <TextField
            select
            label="Custom cakes"
            value={settings?.customCakesMode ?? 'manual'}
            disabled={!canEdit}
            onChange={(e) => mutation.mutate({ customCakesMode: e.target.value as FulfillmentMode })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="auto">Automatic</MenuItem>
            <MenuItem value="manual">Manual</MenuItem>
          </TextField>
          <TextField
            label="All orders / day"
            type="number"
            value={settings?.globalDailyLimit ?? ''}
            disabled={!canEdit}
            onBlur={(e) =>
              mutation.mutate({ globalDailyLimit: e.target.value === '' ? null : Number(e.target.value) })
            }
            sx={{ width: 160 }}
          />
          <TextField
            label="Occasion window"
            value={`Up to ${APP_CONFIG.occasionMaxDays} days`}
            InputProps={{ readOnly: true }}
            sx={{ minWidth: 180 }}
          />
        </Stack>
        <Stack gap={1.25}>
          {[...parents, ...cakeChildren].map((cat) => {
            const row = settings?.categoryControls.find((c) => c.categoryId === cat.id);
            const used = cat.dailyAccepted;
            const cap = row?.dailyLimit ?? cat.dailyLimit;
            const pct = cap ? Math.min(100, (used / cap) * 100) : 0;
            return (
              <Stack
                key={cat.id}
                direction={{ xs: 'column', sm: 'row' }}
                gap={1.5}
                alignItems={{ sm: 'center' }}
                sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'background.default' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={800} fontSize={14}>
                    {cat.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {used}/{cap ?? '∞'} today{pct >= 80 ? ' · 80% alert' : ''}
                  </Typography>
                  {cap ? (
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color={pct >= 80 ? 'warning' : 'primary'}
                      sx={{ mt: 0.75, height: 6, borderRadius: 99, bgcolor: 'rgba(28,25,23,0.06)' }}
                    />
                  ) : null}
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={row?.acceptsOrders ?? cat.acceptsOrders}
                      disabled={!canEdit}
                      onChange={(_, checked) =>
                        mutation.mutate({
                          categoryControls: [
                            {
                              categoryId: cat.id,
                              acceptsOrders: checked,
                              orderMode: row?.orderMode ?? cat.orderMode,
                              dailyLimit: row?.dailyLimit ?? cat.dailyLimit,
                            },
                          ],
                        })
                      }
                    />
                  }
                  label="Open"
                />
                <TextField
                  select
                  label="Mode"
                  value={row?.orderMode ?? cat.orderMode}
                  disabled={!canEdit}
                  onChange={(e) =>
                    mutation.mutate({
                      categoryControls: [
                        {
                          categoryId: cat.id,
                          orderMode: e.target.value as FulfillmentMode,
                          acceptsOrders: row?.acceptsOrders ?? cat.acceptsOrders,
                          dailyLimit: row?.dailyLimit ?? cat.dailyLimit,
                        },
                      ],
                    })
                  }
                  sx={{ minWidth: { xs: '100%', sm: 150 } }}
                >
                  <MenuItem value="auto">Automatic</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </TextField>
                <TextField
                  label="Daily limit"
                  type="number"
                  value={row?.dailyLimit ?? cat.dailyLimit ?? ''}
                  disabled={!canEdit}
                  onBlur={(e) =>
                    mutation.mutate({
                      categoryControls: [
                        {
                          categoryId: cat.id,
                          dailyLimit: e.target.value === '' ? null : Number(e.target.value),
                          orderMode: row?.orderMode ?? cat.orderMode,
                          acceptsOrders: row?.acceptsOrders ?? cat.acceptsOrders,
                        },
                      ],
                    })
                  }
                  sx={{ width: { xs: '100%', sm: 130 } }}
                />
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
