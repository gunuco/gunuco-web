import { Link } from '@mui/material';

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      sx={{
        position: 'absolute',
        left: 12,
        top: 12,
        zIndex: 4000,
        px: 1.5,
        py: 1,
        borderRadius: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 700,
        transform: 'translateY(-200%)',
        '&:focus': { transform: 'none', outline: '2px solid #C4A574' },
      }}
    >
      Skip to content
    </Link>
  );
}
