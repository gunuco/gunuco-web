import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  AppBar,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { APP_CONFIG } from '@/config/app.config';
import { ROLE_LABELS } from '@/constants/roles';
import { brand } from '@/theme/colors';
import { SIDEBAR_WIDTH } from '@/layouts/Sidebar';
import { navForRole, isCustomerSupport } from '@/utils/permissions';
import { useOrders } from '@/hooks/useOrders';
import { formatTime } from '@/utils/format';

interface HeaderProps {
  onMenu: () => void;
}

export function Header({ onMenu }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [noteEl, setNoteEl] = useState<null | HTMLElement>(null);
  const [clock, setClock] = useState(() => new Date());
  const pending = useOrders({ status: 'not_accepted', page: 1, pageSize: 6 });
  const navItems = user ? navForRole(user.role) : [];
  const alerts = isCustomerSupport(user?.role) ? [] : (pending.data?.data ?? []);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const options = useMemo(
    () => navItems.map((item) => ({ label: item.label, path: item.path })),
    [navItems],
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        ml: { lg: `${SIDEBAR_WIDTH}px` },
        width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, md: 72 }, width: '100%' }}>
        <IconButton onClick={onMenu} sx={{ display: { lg: 'none' } }} aria-label="Open menu">
          <MenuRoundedIcon />
        </IconButton>
        <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 160, flexShrink: 0 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Production house
          </Typography>
          <Typography
            fontWeight={800}
            fontSize={14}
            sx={{
              display: 'inline-block',
              mt: 0.25,
              px: 1,
              py: 0.15,
              borderRadius: 0.8,
              bgcolor: alpha(brand.gold, 0.22),
              color: brand.wine,
              border: `1px solid ${alpha(brand.gold, 0.45)}`,
            }}
          >
            {APP_CONFIG.city}
          </Typography>
        </Box>
        <Autocomplete
          size="small"
          options={options}
          getOptionLabel={(o) => o.label}
          onChange={(_e, value) => value && navigate(value.path)}
          sx={{ flex: 1, minWidth: 0, maxWidth: 420, display: { xs: 'none', sm: 'block' } }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search orders, menu, tickets…"
              inputProps={{ ...params.inputProps, 'aria-label': 'Search pages' }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Stack
          direction="row"
          alignItems="center"
          gap={1.25}
          sx={{ ml: 'auto', flexShrink: 0 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, minWidth: 52, textAlign: 'right' }}
          >
            {clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Chip
            size="small"
            label="Live"
            sx={{ bgcolor: '#E4F6EE', color: '#0F513D', fontWeight: 700 }}
          />
          {isCustomerSupport(user?.role) ? null : (
            <IconButton onClick={(e) => setNoteEl(e.currentTarget)} aria-label="Orders awaiting acceptance">
              <Badge badgeContent={alerts.length} color="error" max={9}>
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          )}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            onClick={(e) => setAnchor(e.currentTarget)}
            role="button"
            tabIndex={0}
            aria-label="Account menu"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setAnchor(e.currentTarget);
              }
            }}
            sx={{
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              borderRadius: 999,
              '&:hover': { bgcolor: 'rgba(28,25,23,0.04)' },
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 12, color: brand.goldLight }}>
              {user?.avatarInitials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.15 }}>
              <Typography
                fontSize={13}
                fontWeight={user?.role === 'owner' ? 800 : 700}
                noWrap
                sx={{ color: user?.role === 'owner' ? brand.goldDark : 'inherit' }}
              >
                {user?.name}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: user?.role === 'owner' ? brand.gold : 'text.secondary',
                  fontWeight: user?.role === 'owner' ? 800 : 400,
                }}
              >
                {user ? ROLE_LABELS[user.role] : ''}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <Popover
          open={Boolean(noteEl)}
          anchorEl={noteEl}
          onClose={() => setNoteEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Stack sx={{ width: { xs: 280, sm: 320 }, maxWidth: 'calc(100vw - 32px)', p: 2 }} gap={1.25}>
            <Typography fontWeight={700}>Needs review</Typography>
            {alerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No orders awaiting acceptance.
              </Typography>
            ) : (
              alerts.map((order) => (
                <Stack
                  key={order.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setNoteEl(null);
                    navigate(`/orders?focus=${order.id}`);
                  }}
                >
                  <Typography fontWeight={700} fontSize={13}>
                    {order.orderNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.customerName} · {formatTime(order.createdAt)}
                  </Typography>
                </Stack>
              ))
            )}
          </Stack>
        </Popover>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              navigate('/settings');
            }}
          >
            Settings
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              logout();
              navigate('/login');
            }}
          >
            <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
