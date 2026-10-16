import { useState } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import PeopleIcon from '@mui/icons-material/People'
import ClassIcon from '@mui/icons-material/Class'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import SensorsIcon from '@mui/icons-material/Sensors'
import HistoryIcon from '@mui/icons-material/History'
import BarChartIcon from '@mui/icons-material/BarChart'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext.jsx'

const drawerWidth = 240

const menu = [
  { text: 'Monitoramento', path: '/monitoramento', icon: <SensorsIcon /> },
  { text: 'Monitoramentos', path: '/monitoramentos', icon: <HistoryIcon /> },
  { text: 'Indicadores', path: '/indicadores', icon: <BarChartIcon /> },
  { text: 'Professores', path: '/professores', icon: <PeopleIcon /> },
  { text: 'Turmas', path: '/turmas', icon: <ClassIcon /> },
  { text: 'Lotação', path: '/lotacao', icon: <AssignmentIndIcon /> },
]

function Layout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          MoniSom
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menu.map((item) => (
          <ListItemButton key={item.path} component={NavLink} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            MoniSom Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {auth?.name}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
