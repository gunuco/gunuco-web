import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Button, Card, CardContent, Chip, FormControlLabel, IconButton, Slider, Stack, Switch, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { CoverageMap } from '@/features/fulfilment/CoverageMap';
import { useUiStore } from '@/store/uiStore';
import {
  useFulfilmentStore,
  type DeliveryBand,
} from '@/store/fulfilmentStore';
import { formatCurrency } from '@/utils/format';

const emptyBand = (): DeliveryBand => ({
  id: `band_${Date.now()}`,
  fromKm: 0,
  toKm: 5,
  fee: 0,
  label: '',
  active: true,
});

export function FulfilmentSettingsPage() {
  const notify = useUiStore((s) => s.notify);
  const pickupEnabled = useFulfilmentStore((s) => s.pickupEnabled);
  const doorstepEnabled = useFulfilmentStore((s) => s.doorstepEnabled);
  const nationwideEnabled = useFulfilmentStore((s) => s.nationwideEnabled);
  const cityCookiesEnabled = useFulfilmentStore((s) => s.cityCookiesEnabled);
  const allIndiaCookiesEnabled = useFulfilmentStore((s) => s.allIndiaCookiesEnabled);
  const customCakeExempt = useFulfilmentStore((s) => s.customCakeExempt);
  const maxDoorstepKm = useFulfilmentStore((s) => s.maxDoorstepKm);
  const minOrderFreeDelivery = useFulfilmentStore((s) => s.minOrderFreeDelivery);
  const peakSurchargePct = useFulfilmentStore((s) => s.peakSurchargePct);
  const pickupBufferMins = useFulfilmentStore((s) => s.pickupBufferMins);
  const sameDayCutoff = useFulfilmentStore((s) => s.sameDayCutoff);
  const store = useFulfilmentStore((s) => s.store);
  const pins = useFulfilmentStore((s) => s.pins);
  const bands = useFulfilmentStore((s) => s.bands);
  const selectedPinId = useFulfilmentStore((s) => s.selectedPinId);
  const selected = pins.find((pin) => pin.id === selectedPinId) ?? pins[0];
  const [editing, setEditing] = useState<DeliveryBand | null>(null);
  const [pinLabel, setPinLabel] = useState('');

  const columns: Column<DeliveryBand>[] = [
    { id: 'from', label: 'From', render: (r) => `${r.fromKm} km` },
    { id: 'to', label: 'To', render: (r) => `${r.toKm} km` },
    { id: 'rule', label: 'Boundary', render: (r) => r.label },
    { id: 'fee', label: 'Fee', render: (r) => (r.fee === 0 ? 'Free' : formatCurrency(r.fee)) },
    {
      id: 'st',
      label: 'Status',
      render: (r) => (
        <Chip size="small" color={r.active ? 'success' : 'default'} label={r.active ? 'Active' : 'Off'} />
      ),
    },
    {
      id: 'edit',
      label: '',
      align: 'right',
      render: (r) => (
        <Stack direction="row" justifyContent="flex-end">
          <IconButton size="small" onClick={() => setEditing({ ...r })} aria-label="Edit band">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              useFulfilmentStore.getState().removeBand(r.id);
              notify('Distance band removed');
            }}
            aria-label="Delete band"
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const dropPin = (lat: number, lng: number) => {
    useFulfilmentStore.getState().addPin({
      label: pinLabel.trim() || `Zone ${pins.length}`,
      lat,
      lng,
      radiusKm: 5,
      active: true,
    });
    setPinLabel('');
    notify('Coverage pin dropped');
  };

  const saveBand = () => {
    if (!editing) return;
    const label = editing.label.trim() || `${editing.fromKm}–${editing.toKm} km`;
    useFulfilmentStore.getState().saveBand({ ...editing, label });
    setEditing(null);
    notify('Distance band saved');
  };

  return (
    <Stack gap={2.5}>
      <PageHeader
        highlightTitle
        eyebrow="Fulfilment"
        title="Delivery & Pickup Settings"
        subtitle="Pickup-at-Store is always free. Doorstep fees use road distance. Drop pins and set radius on the map."
      />
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems="center" flexWrap="wrap">
            <Stack direction="row" alignItems="center" gap={1}>
              <Switch
                checked={pickupEnabled}
                onChange={(_, on) => useFulfilmentStore.getState().setPickup(on)}
              />
              <Typography fontWeight={700}>Pickup-at-Store</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <Switch
                checked={doorstepEnabled}
                onChange={(_, on) => useFulfilmentStore.getState().setDoorstep(on)}
              />
              <Typography fontWeight={700}>Doorstep-Delivery</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <Switch
                checked={nationwideEnabled}
                onChange={(_, on) => useFulfilmentStore.getState().setNationwide(on)}
              />
              <Typography fontWeight={700}>Nationwide courier</Typography>
            </Stack>
            <TextField
              label="Max doorstep distance"
              type="number"
              value={maxDoorstepKm}
              onChange={(e) => useFulfilmentStore.getState().setMaxDoorstepKm(Number(e.target.value) || 0)}
              sx={{ width: { xs: '100%', sm: 180 } }}
              InputProps={{ endAdornment: <Typography variant="caption">km</Typography> }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Service area · pins & radius</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            The wine pin is the production house. Click the map to add a radius zone. Select a pin to change its km
            coverage.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} sx={{ mb: 1.5 }} alignItems={{ md: 'center' }}>
            <TextField
              size="small"
              label="New pin name"
              placeholder="Benz Circle hub"
              value={pinLabel}
              onChange={(e) => setPinLabel(e.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
            />
            <TextField
              size="small"
              label="Store lat"
              type="number"
              value={store.lat}
              onChange={(e) =>
                useFulfilmentStore.getState().setStorePin(Number(e.target.value), store.lng)
              }
              sx={{ width: { xs: '100%', sm: 140 } }}
            />
            <TextField
              size="small"
              label="Store lng"
              type="number"
              value={store.lng}
              onChange={(e) =>
                useFulfilmentStore.getState().setStorePin(store.lat, Number(e.target.value))
              }
              sx={{ width: { xs: '100%', sm: 140 } }}
            />
          </Stack>
          <CoverageMap
            center={store}
            viewKm={Math.max(maxDoorstepKm, selected?.radiusKm ?? 8) + 2}
            pins={pins}
            selectedId={selectedPinId}
            onSelect={(id) => useFulfilmentStore.getState().selectPin(id)}
            onDropPin={dropPin}
          />
          {selected ? (
            <Stack gap={1} sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={800}>{selected.label}</Typography>
                {selected.id !== 'pin_store' ? (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => useFulfilmentStore.getState().removePin(selected.id)}
                  >
                    Remove pin
                  </Button>
                ) : null}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)} · radius {selected.radiusKm} km
              </Typography>
              <Slider
                min={1}
                max={25}
                step={0.5}
                value={selected.radiusKm}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v} km`}
                onChange={(_e, value) =>
                  useFulfilmentStore.getState().updatePin(selected.id, { radiusKm: Number(value) })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={selected.active}
                    onChange={(_, on) => useFulfilmentStore.getState().updatePin(selected.id, { active: on })}
                  />
                }
                label="Zone active"
              />
            </Stack>
          ) : null}
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
            {pins.map((pin) => (
              <Chip
                key={pin.id}
                label={`${pin.label} · ${pin.radiusKm} km`}
                color={pin.id === selectedPinId ? 'primary' : 'default'}
                variant={pin.active ? 'filled' : 'outlined'}
                onClick={() => useFulfilmentStore.getState().selectPin(pin.id)}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Distance bands</Typography>
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setEditing(emptyBand())}>
          Add band
        </Button>
      </Stack>
      <DataTable columns={columns} rows={bands} rowKey={(r) => r.id} />

      <Card>
        <CardContent>
          <Typography variant="h6">NYC Cookies delivery coverage</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Visible only for GUNUCO NYC COOKIES. Regular City is ON. All-India is OFF by default. Nationwide orders use
            courier tracking, never local riders.
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip
              color={cityCookiesEnabled ? 'success' : 'default'}
              label={cityCookiesEnabled ? 'Regular City Delivery ON' : 'Regular City Delivery OFF'}
              onClick={() => useFulfilmentStore.getState().setCityCookies(!cityCookiesEnabled)}
            />
            <Chip
              color={allIndiaCookiesEnabled ? 'success' : 'default'}
              label={allIndiaCookiesEnabled ? 'All-India Delivery ON' : 'All-India Delivery OFF'}
              onClick={() => useFulfilmentStore.getState().setAllIndiaCookies(!allIndiaCookiesEnabled)}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Extra controls
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2} flexWrap="wrap">
            <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 240 }}>
              <Switch
                checked={customCakeExempt}
                onChange={(_, on) => useFulfilmentStore.getState().setCustomCakeExempt(on)}
              />
              <Typography fontWeight={700}>Custom cakes fee-exempt</Typography>
            </Stack>
            <TextField
              label="Free delivery above"
              type="number"
              value={minOrderFreeDelivery}
              onChange={(e) => useFulfilmentStore.getState().setMinOrderFreeDelivery(Number(e.target.value) || 0)}
              sx={{ width: { xs: '100%', sm: 180 } }}
              helperText="0 = no threshold"
            />
            <TextField
              label="Peak surcharge %"
              type="number"
              value={peakSurchargePct}
              onChange={(e) => useFulfilmentStore.getState().setPeakSurchargePct(Number(e.target.value) || 0)}
              sx={{ width: { xs: '100%', sm: 160 } }}
            />
            <TextField
              label="Pickup buffer (min)"
              type="number"
              value={pickupBufferMins}
              onChange={(e) => useFulfilmentStore.getState().setPickupBufferMins(Number(e.target.value) || 0)}
              sx={{ width: { xs: '100%', sm: 180 } }}
            />
            <TextField
              label="Same-day cutoff"
              type="time"
              value={sameDayCutoff}
              onChange={(e) => useFulfilmentStore.getState().setSameDayCutoff(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: '100%', sm: 180 } }}
            />
          </Stack>
        </CardContent>
      </Card>

      <AppModal open={Boolean(editing)} title={editing?.label ? 'Edit distance band' : 'Add distance band'} onClose={() => setEditing(null)}>
        {editing ? (
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField
              label="Label"
              value={editing.label}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
            />
            <Stack direction="row" gap={1.5}>
              <TextField
                label="From km"
                type="number"
                value={editing.fromKm}
                onChange={(e) => setEditing({ ...editing, fromKm: Number(e.target.value) || 0 })}
              />
              <TextField
                label="To km"
                type="number"
                value={editing.toKm}
                onChange={(e) => setEditing({ ...editing, toKm: Number(e.target.value) || 0 })}
              />
              <TextField
                label="Fee ₹"
                type="number"
                value={editing.fee}
                onChange={(e) => setEditing({ ...editing, fee: Number(e.target.value) || 0 })}
              />
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <Switch
                checked={editing.active}
                onChange={(_, on) => setEditing({ ...editing, active: on })}
              />
              <Typography>Active</Typography>
            </Stack>
            <Button variant="contained" onClick={saveBand}>
              Save band
            </Button>
          </Stack>
        ) : null}
      </AppModal>
    </Stack>
  );
}
