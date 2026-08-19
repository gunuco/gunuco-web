import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { CategoryAttributeSchema } from '@/types';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: string;
  multiline?: boolean;
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  multiline,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          type={type}
          multiline={multiline}
          minRows={multiline ? 3 : undefined}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
}: FormFieldProps<T> & { options: { value: string; label: string }[] }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth error={Boolean(fieldState.error)} size="small">
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label}>
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

export function SchemaField<T extends FieldValues>({
  schema,
  control,
  namePrefix = 'attributes',
}: {
  schema: CategoryAttributeSchema;
  control: Control<T>;
  namePrefix?: string;
}) {
  const name = `${namePrefix}.${schema.key}` as Path<T>;
  if (schema.type === 'select' && schema.options) {
    return <SelectField name={name} control={control} label={schema.label} options={schema.options} />;
  }
  if (schema.type === 'number') {
    return <FormField name={name} control={control} label={schema.label} type="number" />;
  }
  return <FormField name={name} control={control} label={schema.label} />;
}
