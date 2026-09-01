import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CustomizationsCell } from '@/components/orders/CustomerCell';
import { HighlightName } from '@/components/orders/HighlightName';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { RowControls } from '@/features/feedback/RowControls';
import {
  TestimonialDialog,
  emptyTestimonialForm,
  formFromTestimonial,
  type TestimonialForm,
} from '@/features/feedback/TestimonialDialog';
import { useDeleteTestimonial, useTestimonials, useUpdateTestimonial } from '@/hooks/useResources';
import { useAuthStore } from '@/store/authStore';
import { useConfirm } from '@/hooks/useConfirm';
import { brand } from '@/theme/colors';
import type { Testimonial } from '@/types';
import { isPendingForId } from '@/utils/mutation';
import { canManageCatalog } from '@/utils/permissions';

export function TestimonialsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const list = useTestimonials();
  const update = useUpdateTestimonial();
  const remove = useDeleteTestimonial();
  const confirmApi = useConfirm();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyTestimonialForm);

  const published = useMemo(
    () => (list.data ?? []).filter((row) => row.active),
    [list.data],
  );

  const openEditor = (row: Testimonial) => {
    setForm(formFromTestimonial(row));
    setEditing(row);
  };

  const save = () => {
    if (!editing) return;
    update.mutate(
      {
        id: editing.id,
        payload: {
          displayName: form.displayName.trim(),
          quote: form.quote.trim(),
          channels: form.channels,
          active: form.active,
        },
      },
      { onSuccess: () => setEditing(null) },
    );
  };

  const setHidden = (row: Testimonial, hidden: boolean) => {
    update.mutate(
      { id: row.id, payload: { active: !hidden } },
      {
        onSuccess: () => {
          if (editing?.id === row.id) setForm((current) => ({ ...current, active: !hidden }));
        },
      },
    );
  };

  const deleteRow = async (row: Testimonial) => {
    const ok = await confirmApi.confirm(
      'Delete this testimonial?',
      `“${row.quote}” will be removed from the home page.`,
    );
    if (ok) {
      remove.mutate(row.id, { onSuccess: () => setEditing(null) });
    }
  };

  const columns: Column<Testimonial>[] = [
    { id: 'name', label: 'Display name', render: (r) => <HighlightName value={r.displayName} tone="wine" /> },
    { id: 'quote', label: 'Message', render: (r) => <CustomizationsCell value={r.quote} /> },
    {
      id: 'home',
      label: 'Home page',
      render: (r) => (
        <StatusChip status={r.active ? 'published' : 'hidden'} label={r.active ? 'Visible' : 'Hidden'} />
      ),
    },
    {
      id: 'ctrl',
      label: 'Controls',
      noWrap: true,
      minWidth: 300,
      render: (r) =>
        canEdit ? (
          <RowControls>
            <Button
              size="small"
              variant="contained"
              onClick={() => openEditor(r)}
            >
              Edit
            </Button>
            {r.active ? (
              <Button size="small" disabled={isPendingForId(update, r.id)} onClick={() => setHidden(r, true)}>
                Hide
              </Button>
            ) : (
              <Button size="small" disabled={isPendingForId(update, r.id)} onClick={() => setHidden(r, false)}>
                Unhide
              </Button>
            )}
            <Button
              size="small"
              color="error"
              disabled={isPendingForId(remove, r.id)}
              onClick={() => void deleteRow(r)}
            >
              Delete
            </Button>
          </RowControls>
        ) : null,
    },
  ];

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Brand"
        title="Testimonials"
        subtitle="Home-page quotes only — the message, not Order ID. Use Edit, Hide, Unhide, or Delete on each row."
        actions={
          <Button component={RouterLink} to="/feedback" variant="outlined">
            Customer feedback
          </Button>
        }
      />

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: `1px solid ${brand.line}`,
          borderRadius: 1.5,
          bgcolor: brand.cream,
        }}
      >
        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: brand.wine,
            mb: 1.5,
          }}
        >
          Home page preview
        </Typography>
        {published.length === 0 ? (
          <Typography color="text.secondary">
            Nothing is visible on the home page yet. Approve consented feedback, or unhide a quote below.
          </Typography>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} flexWrap="wrap">
            {published.map((row) => (
              <Box
                key={row.id}
                sx={{
                  flex: '1 1 240px',
                  maxWidth: { md: 360 },
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: brand.creamPaper,
                  borderLeft: `4px solid ${brand.gold}`,
                  cursor: 'pointer',
                }}
                onClick={() => openEditor(row)}
              >
                <Typography sx={{ fontStyle: 'italic', fontWeight: 700, mb: 1.25 }}>“{row.quote}”</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: brand.wine }}>
                  {row.displayName}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <DataTable
        headerFit
        minWidth={1080}
        columns={columns}
        rows={list.data ?? []}
        rowKey={(r) => r.id}
        loading={list.isLoading ? 4 : false}
        onRowClick={(row) => openEditor(row)}
        emptyMessage="No testimonials yet. Approve feedback with consent to create one."
      />

      <TestimonialDialog
        open={Boolean(editing)}
        form={form}
        canEdit={canEdit}
        saving={editing ? isPendingForId(update, editing.id) : false}
        deleting={editing ? isPendingForId(remove, editing.id) : false}
        onChange={(next) => setForm((current) => ({ ...current, ...next }))}
        onClose={() => setEditing(null)}
        onSave={save}
        onDelete={editing ? () => void deleteRow(editing) : undefined}
        onHide={() => editing && setHidden(editing, true)}
        onUnhide={() => editing && setHidden(editing, false)}
      />
      <ConfirmDialog
        open={confirmApi.open}
        title={confirmApi.title}
        description={confirmApi.description}
        danger
        confirmLabel="Delete"
        onCancel={() => confirmApi.handleClose(false)}
        onConfirm={() => confirmApi.handleClose(true)}
      />
    </Stack>
  );
}
