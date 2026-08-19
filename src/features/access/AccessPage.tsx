import { Chip, Stack, Typography } from '@mui/material';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROLE_LABELS } from '@/constants/roles';
import { seedUsers } from '@/mocks/data/users';
import type { User } from '@/types';

export function AccessPage() {
  const columns: Column<User>[] = [
    { id: 'name', label: 'Name', render: (r) => r.name },
    { id: 'email', label: 'Email', render: (r) => r.email },
    { id: 'role', label: 'Role', render: (r) => ROLE_LABELS[r.role] },
    { id: 'loc', label: 'Locations', render: (r) => r.locationIds.join(', ') },
    { id: 'st', label: 'Status', render: () => <Chip size="small" label="Active" color="success" /> },
  ];
  return (
    <Stack gap={2.5}>
      <PageHeader
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
