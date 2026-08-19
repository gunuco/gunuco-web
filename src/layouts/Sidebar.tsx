import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { NavLink, useLocation } from 'react-router-dom';
import { GunucoMark } from '@/components/brand/GunucoMark';
import { NAV_SECTION_LABELS, NAV_SECTION_ORDER } from '@/constants/nav';
import { NAV_ICONS } from '@/layouts/navIcons';
import { useAuthStore } from '@/store/authStore';
import { brand } from '@/theme/colors';
import { navForRole } from '@/utils/permissions';
import { ROLE_LABELS } from '@/constants/roles';
import type { NavSection } from '@/types';

const WIDTH = 268;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const paperSx = {
  width: WIDTH,
  boxSizing: 'border-box',
  border: 'none',
  background: `linear-gradient(185deg, ${brand.wineMid} 0%, ${brand.wine} 52%, ${brand.wineDark} 100%)`,
  color: brand.cream,
} as const;

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const items = user ? navForRole(user.role) : [];

  const content = (
    <Stack sx={{ height: '100%', color: brand.cream }}>
      <Box
        sx={{
          px: 2.25,
          py: 2.25,
          borderBottom: `1px solid ${alpha(brand.gold, 0.16)}`,
        }}
      >
        <GunucoMark size={40} withWordmark inverted />
      </Box>
      <List
        sx={{
          px: 1.25,
          py: 1.25,
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar-thumb': {
            background: alpha(brand.gold, 0.28),
            borderRadius: 8,
          },
        }}
      >
        {NAV_SECTION_ORDER.map((section) => {
          const sectionItems = items.filter((item) => item.section === section);
          if (!sectionItems.length) return null;
          return (
            <Box key={section} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  px: 1.4,
                  pb: 0.7,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  color: brand.gold,
                  opacity: 0.82,
                }}
              >
                {NAV_SECTION_LABELS[section as NavSection]}
              </Typography>
              {sectionItems.map((item) => {
                const Icon = NAV_ICONS[item.icon] ?? DashboardRoundedFallback;
                const active =
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <ListItemButton
                    key={item.id}
                    component={NavLink}
                    to={item.path}
                    onClick={onClose}
                    selected={active}
                    sx={{
                      mb: 0.3,
                      borderRadius: 2.2,
                      py: 0.85,
                      color: active ? brand.goldLight : alpha(brand.cream, 0.72),
                      position: 'relative',
                      '&.Mui-selected': {
                        bgcolor: alpha(brand.gold, 0.16),
                        color: brand.goldLight,
                        '&:hover': { bgcolor: alpha(brand.gold, 0.22) },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 6,
                          top: 10,
                          bottom: 10,
                          width: 3,
                          borderRadius: 99,
                          bgcolor: brand.gold,
                        },
                      },
                      '&:hover': { bgcolor: alpha(brand.gold, 0.1), color: brand.cream },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13.2,
                        fontWeight: active ? 800 : 600,
                        color: 'inherit',
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </Box>
          );
        })}
      </List>
      {user ? (
        <Stack
          sx={{
            px: 2,
            py: 2,
            borderTop: `1px solid ${alpha(brand.gold, 0.16)}`,
            background: alpha(brand.wine, 0.28),
          }}
          direction="row"
          gap={1.25}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: brand.gold,
              fontSize: 13,
              color: brand.wineDark,
              fontWeight: 800,
            }}
          >
            {user.avatarInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              fontWeight={800}
              fontSize={13}
              sx={{ color: user.role === 'owner' ? brand.gold : brand.cream }}
            >
              {user.name}
            </Typography>
            <Typography
              noWrap
              variant="caption"
              sx={{
                color: user.role === 'owner' ? brand.gold : alpha(brand.goldLight, 0.72),
                fontWeight: user.role === 'owner' ? 800 : 400,
              }}
            >
              {ROLE_LABELS[user.role]}
            </Typography>
          </Box>
        </Stack>
      ) : null}
    </Stack>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': paperSx,
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

function DashboardRoundedFallback() {
  return <Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: 'currentColor' }} />;
}

export const SIDEBAR_WIDTH = WIDTH;
