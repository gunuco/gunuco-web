import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { StatusChip } from '@/components/ui/StatusChip';
import { APP_CONFIG } from '@/config/app.config';
import { brand } from '@/theme/colors';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts } from '@/hooks/useProducts';
import { useAddons, useCheckout } from '@/hooks/useResources';
import { cartTotals, usePosStore } from '@/store/posStore';
import type { Addon, Category, PaymentMethod, Product } from '@/types';
import { buildCategoryTree, getChildCategories, getCategoryById } from '@/utils/category';
import { formatCurrency } from '@/utils/format';
import { quoteProduct } from '@/utils/pricing';

const REASONS = [
  'No mobile device',
  'Device unavailable',
  'Application unavailable',
  'Accessibility assistance',
] as const;

export function PosPage() {
  const [search, setSearch] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [selectedCat, setSelectedCat] = useState('cat_cakes');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [reason, setReason] = useState<(typeof REASONS)[number]>('No mobile device');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const debounced = useDebounce(search);
  const { data: categories = [] } = useCategories();
  const products = useProducts({ active: true, search: debounced || undefined });
  const addons = useAddons();
  const checkout = useCheckout();
  const lines = usePosStore((s) => s.lines);
  const addLine = usePosStore((s) => s.addLine);
  const setQty = usePosStore((s) => s.setQty);
  const removeLine = usePosStore((s) => s.removeLine);
  const discount = usePosStore((s) => s.discount);
  const setDiscount = usePosStore((s) => s.setDiscount);
  const clear = usePosStore((s) => s.clear);
  const totals = cartTotals(lines, discount);
  const tree = buildCategoryTree(categories).filter((c) => c.active);

  const selected = getCategoryById(categories, selectedCat);
  const visible = useMemo(() => {
    const rows = (products.data ?? []).filter((p) => (availableOnly ? p.active : true));
    if (!selected) return rows;
    if (!selected.parentId) {
      const childIds = getChildCategories(categories, selected.id).map((c) => c.id);
      return rows.filter((p) => p.categoryId === selected.id || childIds.includes(p.subcategoryId));
    }
    return rows.filter((p) => p.subcategoryId === selected.id);
  }, [products.data, availableOnly, selected, categories]);

  const addProduct = (product: Product) => {
    const cat = getCategoryById(categories, product.subcategoryId);
    const needsConfig = (cat?.attributeSchema.length ?? 0) > 0 || product.addOnIds.length > 0;
    if (needsConfig) {
      setConfigProduct(product);
      return;
    }
    commitLine(product, product.attributes, []);
  };

  const commitLine = (product: Product, attributes: Product['attributes'], selectedAddOns: Addon[]) => {
    addLine({ product, quantity: 1, attributes, addOns: selectedAddOns });
    setConfigProduct(null);
  };

  const pay = (failPayment = false) => {
    checkout.mutate(
      {
        customerName: customerName || 'Walk-in',
        customerPhone,
        paymentMethod: method,
        failPayment,
        discount,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        notes: reason,
        items: lines.map((l) => ({
          id: l.key,
          productId: l.product.id,
          productName: l.product.name,
          categoryId: l.product.categoryId,
          subcategoryId: l.product.subcategoryId,
          quantity: l.quantity,
          unitPrice: quoteProduct(l.product, l.attributes, l.addOns).base,
          lineTotal: quoteProduct(l.product, l.attributes, l.addOns).base * l.quantity,
          attributes: l.attributes,
          addOns: l.addOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
        })),
      },
      {
        onSuccess: () => {
          clear();
          setPayOpen(false);
          setCustomerName('');
          setCustomerPhone('');
        },
      },
    );
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '240px minmax(0,1fr) 360px' },
        gap: 1.5,
        minHeight: { lg: 'calc(100vh - 140px)' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'auto',
        }}
      >
        <Typography sx={{ px: 2, pt: 2, pb: 1 }} variant="subtitle2" color="text.secondary">
          Categories
        </Typography>
        {tree.map((parent) => (
          <Box key={parent.id}>
            <CatRow cat={parent} selected={selectedCat} onSelect={setSelectedCat} />
            {parent.children
              .filter((c) => c.active)
              .map((child) => (
                <CatRow key={child.id} cat={child} selected={selectedCat} onSelect={setSelectedCat} nested />
              ))}
          </Box>
        ))}
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Assisted POS · Pickup-at-Store
            </Typography>
            <Typography variant="h6">{selected?.name ?? 'Catalogue'} · {visible.length} products</Typography>
            <Typography variant="caption" color="warning.main">
              Use only when the customer cannot order through the application.
            </Typography>
          </Box>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search name or product code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
          />
          <Chip
            label="Available only"
            color={availableOnly ? 'primary' : 'default'}
            onClick={() => setAvailableOnly((v) => !v)}
          />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 1.25,
          }}
        >
          {visible.map((p) => (
            <Box
              key={p.id}
              onClick={() => addProduct(p)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2.5,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                transition: '0.16s ease',
              }}
            >
              <Box
                sx={{
                  height: 88,
                  background: `linear-gradient(145deg, hsl(${p.imageHue} 42% 38%), hsl(${p.imageHue} 28% 16%))`,
                }}
              />
              <Box sx={{ p: 1.25 }}>
                <Typography fontWeight={800} fontSize={13} noWrap>
                  {p.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getCategoryById(categories, p.subcategoryId)?.name}
                </Typography>
                <Typography fontWeight={800} fontSize={14} sx={{ mt: 0.5 }}>
                  {formatCurrency(p.priceTiers[0]?.price ?? 0)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {APP_CONFIG.locationName}
        </Typography>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Current cart
        </Typography>
        <TextField
          select
          fullWidth
          label="Exception reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as typeof reason)}
          sx={{ mb: 1 }}
        >
          {REASONS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <TextField fullWidth label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} sx={{ mb: 1 }} />
        <TextField
          fullWidth
          label={reason === 'No mobile device' ? 'Mobile (optional)' : 'Mobile'}
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <Stack gap={1} sx={{ maxHeight: 260, overflow: 'auto', mb: 1.5 }}>
          {lines.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              Select a product to start the cart.
            </Typography>
          ) : (
            lines.map((line) => {
              const unit = quoteProduct(line.product, line.attributes, line.addOns).base;
              return (
                <Stack key={line.key} direction="row" gap={1} alignItems="center">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={13} noWrap>
                      {line.product.name}
                    </Typography>
                    <Typography variant="caption">{formatCurrency(unit)}</Typography>
                  </Box>
                  <TextField type="number" value={line.quantity} onChange={(e) => setQty(line.key, Number(e.target.value))} sx={{ width: 68 }} />
                  <Button size="small" color="inherit" onClick={() => removeLine(line.key)}>
                    ✕
                  </Button>
                </Stack>
              );
            })
          )}
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <TextField label="Discount ₹" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} fullWidth sx={{ mb: 1.5 }} />
        <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
        <Row label="GST" value={formatCurrency(totals.tax)} />
        <Row label="Delivery" value="Free · Pickup-at-Store" />
        <Row label="Payable" value={formatCurrency(totals.total)} strong />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} disabled={lines.length === 0} onClick={() => setPayOpen(true)}>
          Collect online payment
        </Button>
        <Button fullWidth color="inherit" sx={{ mt: 1 }} disabled={lines.length === 0} onClick={clear}>
          Clear cart
        </Button>
      </Box>

      <AppModal open={payOpen} title="Cashless payment" onClose={() => setPayOpen(false)}>
        <Stack gap={2} sx={{ pt: 1 }}>
          <Typography>Collect {formatCurrency(totals.total)} in full. Cash and COD are not available.</Typography>
          <Stack direction="row" gap={1}>
            {(['upi', 'card', 'netbanking'] as const).map((m) => (
              <Chip key={m} label={m === 'netbanking' ? 'Net banking' : m.toUpperCase()} color={method === m ? 'primary' : 'default'} onClick={() => setMethod(m)} />
            ))}
          </Stack>
          <StatusChip status="processing" label="Gateway verification required" />
          <Button variant="contained" disabled={checkout.isPending} onClick={() => pay(false)}>
            {checkout.isPending ? 'Confirming payment…' : 'Pay full amount'}
          </Button>
          <Button color="error" disabled={checkout.isPending} onClick={() => pay(true)}>
            Simulate decline
          </Button>
        </Stack>
      </AppModal>

      <AppDrawer open={Boolean(configProduct)} title={configProduct?.name ?? 'Configure'} onClose={() => setConfigProduct(null)}>
        {configProduct ? (
          <Stack gap={2}>
            <Typography variant="body2" color="text.secondary">
              Only enabled options are shown. Quantity stays available for every product.
            </Typography>
            <Button
              variant="contained"
              onClick={() =>
                commitLine(
                  configProduct,
                  {
                    ...configProduct.attributes,
                    ...(configProduct.priceTiers[0]
                      ? { weightKg: String(configProduct.priceTiers[0].amount) }
                      : {}),
                  },
                  (addons.data ?? []).filter((a) => configProduct.addOnIds.includes(a.id)).slice(0, 0),
                )
              }
            >
              Add to cart · {formatCurrency(configProduct.priceTiers[0]?.price ?? 0)}
            </Button>
          </Stack>
        ) : null}
      </AppDrawer>
    </Box>
  );
}

function CatRow({
  cat,
  selected,
  onSelect,
  nested,
}: {
  cat: Category;
  selected: string;
  onSelect: (id: string) => void;
  nested?: boolean;
}) {
  const active = selected === cat.id;
  return (
    <Box
      onClick={() => onSelect(cat.id)}
      sx={{
        px: 2,
        py: 1,
        pl: nested ? 3.5 : 2,
        cursor: 'pointer',
        bgcolor: active ? alpha(brand.wine, 0.08) : 'transparent',
        color: active ? 'primary.main' : 'text.primary',
        borderLeft: active ? `3px solid ${brand.wine}` : '3px solid transparent',
        fontWeight: active ? 800 : 600,
        fontSize: nested ? 13 : 13.5,
      }}
    >
      {cat.name}
    </Box>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ my: 0.5 }}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography fontWeight={strong ? 800 : 600} fontSize={strong ? 16 : 14}>
        {value}
      </Typography>
    </Stack>
  );
}
