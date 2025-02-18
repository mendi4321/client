// ייבוא של הספריות והקומפוננטות הנדרשות
import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Login from './Login';
import RegisterModal from './RegisterModal';
// רשימת העמודים שיוצגו בתפריט
const pages = ['Products', 'Pricing', 'Blog'];
// ניהול מצב (State) של הקומפוננטה
function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const username = "mendi"
    // פונקציות לטיפול בפתיחת וסגירת התפריטים
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);  // פתיחת תפריט הניווט
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);    // סגירת תפריט הניווט
    };

    const handleOpenRegisterModal = () => {
        handleCloseNavMenu();
        setShowRegisterModal(true); // פתיחת חלון ההרשמה
    };
    const handleCloseRegisterModal = () => {
        setShowRegisterModal(false);    // סגירת חלון ההרשמה
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);  // פתיחת תפריט המשתמש
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);    // סגירת תפריט המשתמש
    };

    // סרגל הניווט העליון
    return (
        <AppBar position="static" sx={{ backgroundColor: '#658285' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* לוגו - מוצג במסכים גדולים */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: '#e9d0ab',
                            textDecoration: 'none',
                            textAlign: 'center',
                        }}
                    >
                        App mendi
                        <img src="public/logo.webp" alt="logo" style={{ width: '50px', height: '50px' }} />

                    </Typography>
                    {/* תפריט נייד (המבורגר) - מוצג במסכים קטנים */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="#658285"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {/* תפריט נייד - פריטי התפריט */}
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu}>
                                    <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    {/* לוגו - מוצג במסכים קטנים */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: '#e9d0ab',
                            textDecoration: 'none',
                        }}
                    >
                        App mendi
                    </Typography>
                    {/* תפריט רגיל - מוצג במסכים גדולים */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: '#e9d0ab', display: 'block' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>
                    {/* אזור המשתמש */}
                    <Box sx={{ flexGrow: 0, color: '#658285' }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt={username} src='true' />
                            </IconButton>
                        </Tooltip>
                        {/* תפריט המשתמש */}
                        <Popover
                            open={!!anchorElUser}
                            onClose={handleCloseUserMenu}
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <Login openRegister={handleOpenRegisterModal} />
                        </Popover>
                    </Box>
                </Toolbar>
            </Container>
            {/* חלון ההרשמה */}
            <RegisterModal open={showRegisterModal} onClose={handleCloseRegisterModal} />
        </AppBar>
    );
}
export default ResponsiveAppBar;
