import { useState } from 'react';

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Are you sure?');
  const [description, setDescription] = useState('');
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (nextTitle: string, nextDescription: string) => {
    setTitle(nextTitle);
    setDescription(nextDescription);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = (value: boolean) => {
    setOpen(false);
    resolver?.(value);
    setResolver(null);
  };

  return { open, title, description, confirm, handleClose };
}
