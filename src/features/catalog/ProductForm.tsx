import { Button, Divider, MenuItem, TextField, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { SchemaField } from '@/components/ui/FormField';
import { PricingPreview } from '@/features/catalog/PricingPreview';
import type { Category, Product } from '@/types';
import { getAttributeSchema, getCategoryById, getChildCategories, getParentCategories } from '@/utils/category';

interface FormValues {
  name: string;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  active: string;
  attributes: Record<string, string>;
  priceTiersText: string;
}

interface Props {
  open: boolean;
  product: Product | null;
  categories: Category[];
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Product>) => void;
}

export function ProductForm({ open, product, categories, saving, onClose, onSave }: Props) {
  const { control, register, watch, reset, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      name: '',
      sku: '',
      categoryId: '',
      subcategoryId: '',
      description: '',
      active: 'true',
      attributes: {},
      priceTiersText: '0.5:1299\n1:2299',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        description: product.description,
        active: product.active ? 'true' : 'false',
        attributes: Object.fromEntries(
          Object.entries(product.attributes).map(([k, v]) => [k, String(v)]),
        ),
        priceTiersText: product.priceTiers.map((t) => `${t.amount}:${t.price}`).join('\n'),
      });
    } else {
      const firstParent = getParentCategories(categories).find((c) => c.active);
      const firstChild = firstParent ? getChildCategories(categories, firstParent.id)[0] : undefined;
      reset({
        name: '',
        sku: '',
        categoryId: firstParent?.id ?? '',
        subcategoryId: firstChild?.id ?? '',
        description: '',
        active: 'true',
        attributes: {},
        priceTiersText: '0.5:1299\n1:2299',
      });
    }
  }, [open, product, categories, reset]);

  const subcategoryId = watch('subcategoryId');
  const categoryId = watch('categoryId');
  const attributes = watch('attributes');
  const priceTiersText = watch('priceTiersText');
  const children = getChildCategories(categories, categoryId);
  const schema = getAttributeSchema(getCategoryById(categories, subcategoryId));

  const previewProduct = useMemo(() => {
    const tiers = priceTiersText
      .split('\n')
      .map((line, i) => {
        const [amount, price] = line.split(':').map((s) => Number(s.trim()));
        return { id: `p${i}`, label: String(amount), amount, price };
      })
      .filter((t) => !Number.isNaN(t.amount) && !Number.isNaN(t.price));
    return {
      id: 'preview',
      name: watch('name') || 'Preview',
      sku: '',
      categoryId,
      subcategoryId,
      description: '',
      imageHue: 20,
      active: true,
      attributes,
      priceTiers: tiers,
      addOnIds: [],
      tags: [],
      createdAt: '',
      updatedAt: '',
    } as Product;
  }, [attributes, categoryId, priceTiersText, subcategoryId, watch]);

  return (
    <AppDrawer
      open={open}
      title={product ? 'Edit product' : 'Add product'}
      width={520}
      onClose={onClose}
      footer={
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSubmit((values) => {
            const priceTiers = values.priceTiersText
              .split('\n')
              .map((line, i) => {
                const [amount, price] = line.split(':').map((s) => Number(s.trim()));
                return { id: `t${i}`, label: String(amount), amount, price };
              })
              .filter((t) => !Number.isNaN(t.amount));
            onSave({
              name: values.name,
              sku: values.sku,
              categoryId: values.categoryId,
              subcategoryId: values.subcategoryId,
              description: values.description,
              active: values.active === 'true',
              attributes: values.attributes,
              priceTiers,
            });
          })}
        >
          {saving ? 'Saving…' : 'Save product'}
        </Button>
      }
    >
      <TextField label="Name" {...register('name', { required: true })} fullWidth />
      <TextField label="SKU" {...register('sku')} fullWidth />
      <TextField
        select
        label="Parent category"
        value={categoryId}
        onChange={(e) => {
          setValue('categoryId', e.target.value);
          const first = getChildCategories(categories, e.target.value)[0];
          setValue('subcategoryId', first?.id ?? '');
        }}
      >
        {getParentCategories(categories)
          .filter((c) => c.active)
          .map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
      </TextField>
      <TextField select label="Subcategory" {...register('subcategoryId')}>
        {children.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField label="Description" multiline minRows={2} {...register('description')} />
      <TextField select label="Visibility" {...register('active')}>
        <MenuItem value="true">Active</MenuItem>
        <MenuItem value="false">Hidden</MenuItem>
      </TextField>
      <Divider />
      <Typography variant="subtitle2">Attributes (from category schema)</Typography>
      {schema.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          This category has no attribute schema yet.
        </Typography>
      ) : (
        schema.map((field) => <SchemaField key={field.key} schema={field} control={control} />)
      )}
      <TextField
        label="Pricing matrix (amount:price per line)"
        multiline
        minRows={4}
        {...register('priceTiersText')}
        helperText="Example: 0.5:1299 — driven by the category pricing model (weight, pack, size)."
      />
      <PricingPreview product={previewProduct} attributes={attributes} />
    </AppDrawer>
  );
}
