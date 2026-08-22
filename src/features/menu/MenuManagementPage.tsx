import { Box, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AddonsPage } from '@/features/addons/AddonsPage';
import { CategoriesPage } from '@/features/categories/CategoriesPage';
import { CustomizationPricingTab } from '@/features/menu/CustomizationPricingTab';
import { MenuPricingTab } from '@/features/menu/MenuPricingTab';
import { MenuProductsTab } from '@/features/menu/MenuProductsTab';
import { useCategories } from '@/hooks/useCategories';
import { brand } from '@/theme/colors';
import { buildCategoryTree } from '@/utils/category';
import { canManageCatalog } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

const TABS = ['Products', 'Categories', 'Add-ons', 'Customization', 'Pricing'] as const;

export function MenuManagementPage() {
  const [tab, setTab] = useState(0);
  const [treeCategoryId, setTreeCategoryId] = useState('');
  const { data: categories = [] } = useCategories();
  const tree = buildCategoryTree(categories);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canManageCatalog(role) : false;
  const showTree = tab === 0;

  const selectTreeNode = (id: string) => {
    setTreeCategoryId((current) => (current === id ? '' : id));
  };

  return (
    <Stack gap={2.5}>
      <PageHeader
        eyebrow="Catalogue"
        title="Menu Management"
        subtitle="Zomato-style menu editor: photo, base price, variants, customization extras, and a live customer preview."
      />
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="scrollable"
        sx={{
          minHeight: 42,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 42, fontWeight: 700 },
        }}
      >
        {TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: showTree ? { xs: '1fr', md: '220px minmax(0,1fr)' } : 'minmax(0,1fr)',
          gap: 2,
          minHeight: 480,
        }}
      >
        {showTree ? (
          <Paper sx={{ p: 1.5, overflow: 'auto' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
              Filter products
            </Typography>
            <TreeRow
              label="All products"
              selected={treeCategoryId === ''}
              onClick={() => setTreeCategoryId('')}
            />
            {tree.map((parent) => (
              <Box key={parent.id} sx={{ mt: 0.5 }}>
                <TreeRow
                  label={parent.name}
                  selected={treeCategoryId === parent.id}
                  muted={!parent.active}
                  onClick={() => selectTreeNode(parent.id)}
                />
                {parent.children.map((child) => (
                  <TreeRow
                    key={child.id}
                    label={child.name}
                    nested
                    selected={treeCategoryId === child.id}
                    muted={!child.active}
                    onClick={() => selectTreeNode(child.id)}
                  />
                ))}
              </Box>
            ))}
            {!canEdit ? (
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, pt: 1, display: 'block' }}>
                Read-only definitions for this role.
              </Typography>
            ) : null}
          </Paper>
        ) : null}
        <Paper sx={{ p: 2, minWidth: 0 }}>
          {tab === 0 ? <MenuProductsTab categoryId={treeCategoryId} /> : null}
          {tab === 1 ? <CategoriesPage embedded /> : null}
          {tab === 2 ? <AddonsPage embedded /> : null}
          {tab === 3 ? <CustomizationPricingTab /> : null}
          {tab === 4 ? <MenuPricingTab /> : null}
        </Paper>
      </Box>
    </Stack>
  );
}

function TreeRow({
  label,
  selected,
  nested,
  muted,
  onClick,
}: {
  label: string;
  selected: boolean;
  nested?: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: nested ? 2.25 : 1,
        py: 0.55,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: selected ? alpha(brand.wine, 0.1) : 'transparent',
        border: selected ? `1px solid ${alpha(brand.wine, 0.18)}` : '1px solid transparent',
        opacity: muted ? 0.45 : 1,
        '&:hover': { bgcolor: selected ? alpha(brand.wine, 0.12) : alpha(brand.wine, 0.05) },
      }}
    >
      <Typography fontWeight={selected ? 800 : nested ? 500 : 800} fontSize={13} sx={{ color: selected ? brand.wine : 'inherit' }}>
        {label}
      </Typography>
    </Box>
  );
}
