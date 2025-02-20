// ייבוא של הספריות והקומפוננטות הנדרשות
import React, { useState, useContext } from 'react';
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
import { UserContext } from './UserContext';
import UserCard from './UserCard';

// רשימת העמודים שיוצגו בתפריט
const pages = ['Products', 'Pricing', 'Blog'];
// ניהול מצב (State) של הקומפוננטה
function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const { user } = useContext(UserContext);

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
                    {/* לוגו בצד שמאל - מוצג בכל המסכים */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <img src="public/logo.webp" alt="logo" style={{ width: '50px', height: '50px' }} />
                    </Box>

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

                    {/* שם האפליקציה במרכז */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: '#e9d0ab',
                            textDecoration: 'none',
                            display: { xs: 'none', md: 'flex' }  // מוצג רק במסכים גדולים
                        }}
                    >
                        App mendi
                    </Typography>

                    {/* שם האפליקציה במרכז - למסך קטן */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: '#e9d0ab',
                            textDecoration: 'none',
                            display: { xs: 'flex', md: 'none' }  // מוצג רק במסכים קטנים
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

                    {/* אזור המשתמש בצד ימין */}
                    <Box sx={{ flexGrow: 0, color: '#658285' }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                {user ? <Avatar>{user.firstName[0]}{user.lastName[0]}</Avatar> : <Avatar />}
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
                            {/* בדיקה האם יש משתמש מחובר */}
                            {user ? <UserCard closeUser={handleCloseUserMenu} /> : <Login
                                openRegister={handleOpenRegisterModal}
                                closeLogin={handleCloseUserMenu}
                            />}
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
