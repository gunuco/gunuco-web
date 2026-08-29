import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, type ElementType } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GunucoMark } from '@/components/brand/GunucoMark';
import { PageFade } from '@/components/ui/PageFade';
import { SkipLink } from '@/components/ui/SkipLink';
import { ROLE_LABELS } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { brand } from '@/theme/colors';
import { isSupportHost } from '@/utils/supportHost';

const WIDTH = 248;

const DESK_NAV: Array<{ id: string; label: string; path: string; icon: ElementType }> = [
  { id: 'tickets', label: 'Tickets', path: '/support', icon: SupportAgentRoundedIcon },
  { id: 'customers', label: 'Customers', path: '/support/customers', icon: PeopleAltRoundedIcon },
  { id: 'refunds', label: 'Refunds', path: '/support/refunds', icon: CurrencyRupeeRoundedIcon },
  { id: 'settings', label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
];

const paperSx = {
  width: WIDTH,
  boxSizing: 'border-box',
  border: 'none',
  background: brand.wine,
  color: brand.cream,
} as const;

export function SupportLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const subdomain = isSupportHost();

  const nav = (
    <Stack sx={{ height: '100%', color: brand.cream }}>
      <Box sx={{ px: 2.25, py: 2.25, borderBottom: `1px solid ${alpha(brand.gold, 0.16)}` }}>
        <GunucoMark size={40} withWordmark inverted />
        <Typography sx={{ mt: 1, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: brand.goldLight }}>
          SUPPORT DESK{subdomain ? ' · SUBDOMAIN' : ''}
        </Typography>
      </Box>
      <List sx={{ px: 1.25, py: 1.25, flex: 1 }}>
        {DESK_NAV.map((item) => {
          const Icon = item.icon;
          const moreSpecific = DESK_NAV.some(
            (other) =>
              other.path !== item.path &&
              other.path.startsWith(`${item.path}/`) &&
              (location.pathname === other.path || location.pathname.startsWith(`${other.path}/`)),
          );
          const active =
            location.pathname === item.path ||
            (location.pathname.startsWith(`${item.path}/`) && !moreSpecific);
          return (
            <ListItemButton
              key={item.id}
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              selected={active}
              sx={{
                mb: 0.3,
                borderRadius: 2.2,
                py: 0.85,
                color: active ? brand.goldLight : alpha(brand.cream, 0.72),
                '&.Mui-selected': {
                  bgcolor: alpha(brand.gold, 0.16),
                  color: brand.goldLight,
                  '&:hover': { bgcolor: alpha(brand.gold, 0.22) },
                },
                '&:hover': { bgcolor: alpha(brand.gold, 0.1), color: brand.cream },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 13.2, fontWeight: active ? 800 : 600, color: 'inherit' }}
              />
            </ListItemButton>
          );
        })}
      </List>
      {user ? (
        <Stack
          direction="row"
          gap={1.25}
          alignItems="center"
          sx={{ px: 2, py: 2, borderTop: `1px solid ${alpha(brand.gold, 0.16)}` }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: brand.gold, fontSize: 13, color: brand.wineDark, fontWeight: 800 }}>
            {user.avatarInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap fontWeight={800} fontSize={13} sx={{ color: brand.cream }}>
              {user.name}
            </Typography>
            <Typography noWrap variant="caption" sx={{ color: alpha(brand.goldLight, 0.72) }}>
              {ROLE_LABELS[user.role]}
            </Typography>
          </Box>
        </Stack>
      ) : null}
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', overflowX: 'clip' }}>
      <SkipLink />
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        {nav}
      </Drawer>
      <Drawer variant="permanent" open sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': paperSx }}>
        {nav}
      </Drawer>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          ml: { lg: `${WIDTH}px` },
          width: { lg: `calc(100% - ${WIDTH}px)` },
        }}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, md: 72 } }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { lg: 'none' } }}
            aria-label="Open menu"
          >
            <MenuRoundedIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Customer support
            </Typography>
            <Typography fontWeight={800} fontSize={14}>
              {subdomain ? 'support subdomain' : 'Dedicated support panel'}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton
              onClick={() => {
                logout();
                navigate('/login');
              }}
              aria-label="Sign out"
            >
              <LogoutRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        id="main-content"
        component="main"
        tabIndex={-1}
        sx={{
          ml: { lg: `${WIDTH}px` },
          px: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: 1.25, md: 1.5 },
          pb: { xs: 2, md: 2.5 },
          width: { lg: `calc(100% - ${WIDTH}px)` },
          maxWidth: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <PageFade>
          <Outlet />
        </PageFade>
      </Box>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3200}
        onClose={clearToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={clearToast} severity={toast?.severity ?? 'info'} variant="filled" sx={{ borderRadius: 2 }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
