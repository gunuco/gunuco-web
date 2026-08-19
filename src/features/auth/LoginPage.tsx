import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GunucoMark } from '@/components/brand/GunucoMark';
import { APP_CONFIG } from '@/config/app.config';
import { brand } from '@/theme/colors';
import { ROLE_LABELS } from '@/constants/roles';
import { seedUsers, DEMO_PASSWORD } from '@/mocks/data/users';
import { authService } from '@/services/index';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('owner@gunuco.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = (await authService.login(email, password)) as AuthUser;
      setSession(user);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid credentials. Use a demo account below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 7,
          background: `radial-gradient(900px 420px at 18% 12%, ${brand.gold}3D, transparent 52%), linear-gradient(165deg, ${brand.wineDark} 0%, ${brand.wine} 55%, ${brand.wineMid} 100%)`,
          color: brand.cream,
        }}
      >
        <GunucoMark size={44} withWordmark inverted />
        <Box>
          <Typography variant="subtitle2" sx={{ color: brand.gold, mb: 2 }}>
            Admin console
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Fraunces", serif',
              fontSize: 50,
              lineHeight: 1.06,
              maxWidth: 520,
              mb: 2.5,
            }}
          >
            One board for orders, menu and fulfilment.
          </Typography>
          <Typography sx={{ opacity: 0.7, maxWidth: 440, fontSize: 16 }}>
            Owner, Admin and Branch Manager share this panel. Navigation follows role and
            location — Cakes is live, other categories appear when you activate them.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.45, letterSpacing: '0.12em' }}>
          {APP_CONFIG.city.toUpperCase()} · PRODUCTION HOUSE
        </Typography>
      </Box>
      <Stack alignItems="center" justifyContent="center" sx={{ p: 3 }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 440,
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 20px 50px rgba(28,25,23,0.06)',
          }}
        >
          <Stack component="form" onSubmit={submit} gap={2}>
            <Box>
              <Typography variant="subtitle2" color="secondary.dark">
                Welcome back
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5 }}>
                Sign in
              </Typography>
            </Box>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              autoComplete="username"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Signing in…' : 'Continue'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              Demo password for all roles: {DEMO_PASSWORD}
            </Typography>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {seedUsers.map((u) => (
                <Chip
                  key={u.id}
                  size="small"
                  label={ROLE_LABELS[u.role]}
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(DEMO_PASSWORD);
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
