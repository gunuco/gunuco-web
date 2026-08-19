import { Box, Button, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AddonsPage } from '@/features/addons/AddonsPage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { CategoriesPage } from '@/features/categories/CategoriesPage';
import { PricingPage } from '@/features/pricing/PricingPage';
import { useCategories } from '@/hooks/useCategories';
import { buildCategoryTree } from '@/utils/category';
import { canManageCatalog } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

const TABS = ['Products', 'Categories', 'Add-Ons', 'Customization', 'Pricing & Weights', 'Locations'] as const;

export function MenuManagementPage() {
  const [tab, setTab] = useState(0);
  const { data: categories = [] } = useCategories();
  const tree = buildCategoryTree(categories);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Catalogue"
        title="Menu Management"
        subtitle="One workspace for products, categories, add-ons and pricing. Branch Managers can view definitions and update location availability only."
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '240px minmax(0,1fr)' },
          gap: 2,
          minHeight: 560,
        }}
      >
        <Paper sx={{ p: 1.5, overflow: 'auto' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
            Category tree
          </Typography>
          {tree.map((parent) => (
            <Box key={parent.id} sx={{ mb: 1 }}>
              <Typography fontWeight={800} fontSize={13} sx={{ px: 1, opacity: parent.active ? 1 : 0.45 }}>
                {parent.name}
              </Typography>
              {parent.children.map((child) => (
                <Typography key={child.id} variant="body2" sx={{ px: 2, py: 0.4, opacity: child.active ? 1 : 0.45 }}>
                  {child.name}
                </Typography>
              ))}
            </Box>
          ))}
          {!canEdit ? (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              Read-only definitions for this role.
            </Typography>
          ) : null}
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            variant="scrollable"
            sx={{ mb: 2, minHeight: 42, '& .MuiTab-root': { minHeight: 42, fontWeight: 700 } }}
          >
            {TABS.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          {tab === 0 ? <CatalogPage embedded /> : null}
          {tab === 1 ? <CategoriesPage embedded /> : null}
          {tab === 2 ? <AddonsPage /> : null}
          {tab === 3 ? <CustomizationMatrix /> : null}
          {tab === 4 ? <PricingPage /> : null}
          {tab === 5 ? (
            <Typography color="text.secondary">
              Location availability is bound to the production house at launch. Future branches inherit this contract
              without a migration.
            </Typography>
          ) : null}
        </Paper>
      </Box>
    </Stack>
  );
}

function CustomizationMatrix() {
  const { data: categories = [] } = useCategories();
  const groups = ['flavour', 'egg', 'sweetener', 'flour', 'size'] as const;
  return (
    <Stack gap={1.5}>
      <Typography variant="body2" color="text.secondary">
        Each group is independent. ON requires a valid default and 1kg price. OFF hides the group. Inherit uses the
        nearest parent. Quantity cannot be turned off.
      </Typography>
      {categories
        .filter((c) => c.active)
        .map((cat) => (
          <Paper key={cat.id} variant="outlined" sx={{ p: 1.5 }}>
            <Typography fontWeight={800} fontSize={13}>
              {cat.name}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {groups.map((g) => (
                <Button key={g} size="small" variant="outlined" disabled>
                  {g}: {cat.customization[g].toUpperCase()}
                </Button>
              ))}
            </Stack>
          </Paper>
        ))}
    </Stack>
  );
}
