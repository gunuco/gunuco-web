import { Stack, Typography } from '@mui/material';
import { HighlightName } from '@/components/orders/HighlightName';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { ROLE_LABELS } from '@/constants/roles';
import { seedUsers } from '@/mocks/data/users';
import type { User } from '@/types';

export function AccessPage() {
  const columns: Column<User>[] = [
    { id: 'name', label: 'Name', render: (r) => <HighlightName value={r.name} tone="wine" /> },
    { id: 'email', label: 'Email', render: (r) => r.email },
    { id: 'role', label: 'Role', render: (r) => <Typography fontWeight={800}>{ROLE_LABELS[r.role]}</Typography> },
    { id: 'loc', label: 'Locations', render: (r) => r.locationIds.join(', ') },
    { id: 'st', label: 'Status', render: () => <StatusChip status="active" label="Active" /> },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
        highlightTitle
        eyebrow="Security"
        title="Access"
        subtitle="Web admin roles are Owner → Admin → Branch Manager. Support agents and delivery partners use separate panels."
      />
      <DataTable columns={columns} rows={seedUsers} rowKey={(r) => r.id} />
      <Typography variant="body2" color="text.secondary">
        No lower role can create, modify or remove a higher role. Owner MFA is required in production. Branch Managers
        need location assignment and explicit POS permission.
      </Typography>
    </Stack>
  );
}
