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
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Login from './Login';
import RegisterModal from './RegisterModal';
import { UserContext } from './UserContext';
import UserCard from './UserCard';
import { NavLink } from 'react-router-dom';

// רשימת העמודים עם הנתיבים שלהם
const pages = [
    { name: 'בית', path: '/' },
    { name: 'עובר ושב', path: '/income-expenses' },
    { name: 'הכנסות', path: '/income' },
    { name: 'הוצאות', path: '/expenses' },
    { name: 'תזכורות', path: '/reminders' },
    { name: 'בנק', path: '/bank' },
    { name: 'מטלות', path: '/tasks'}
];
export default function UpperBar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const { user } = useContext(UserContext);

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
    const handleCloseNavMenu = () => setAnchorElNav(null);
    const handleOpenRegisterModal = () => {
        handleCloseNavMenu();
        setShowRegisterModal(true);
    };
    const handleCloseRegisterModal = () => setShowRegisterModal(false);
    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    return (
        // תפריט שמוצג בצד שמאל של המסך
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: '#658285' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* לוגו בצד שמאל */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <img src="/logo.png" alt="logo" style={{ width: '50px', height: '50px' }} />
                        </Box>

                        {/* תפריט נייד (המבורגר) */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
                                <MenuIcon sx={{ color: '#e9d0ab' }} />
                            </IconButton>
                            <Menu
                                anchorEl={anchorElNav}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                    '& .MuiPaper-root': {
                                        backgroundColor: '#4a656d'
                                    }
                                }}

                            >
                                {pages.map((page) => (
                                    <NavLink
                                        key={page.name}
                                        to={page.path}
                                        onClick={handleCloseNavMenu}
                                        style={({ isActive }) => ({
                                            display: 'block',
                                            padding: '10px 20px',
                                            color: isActive ? '#e9d0ab' : '#ffffff',
                                            textDecoration: 'none',
                                            backgroundColor: '#4a656d'
                                        })}
                                    >
                                        {page.name}
                                    </NavLink>
                                ))}
                            </Menu>
                        </Box>

                        {/* שם האפליקציה במרכז */}
                        <Typography
                            variant="h5"
                            noWrap
                            sx={{
                                position: 'absolute',
                                left: '30%',
                                transform: 'translateX(-50%)',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: '#e9d0ab',
                                textDecoration: 'none',
                                display: { xs: 'none', md: 'flex' }
                            }}
                        >
                            בית בשליטה
                        </Typography>

                        {/* תפריט ניווט ראשי למסכים גדולים */}
                        <Box sx={{
                            flexGrow: 1, display: {
                                xs: 'none', md: 'flex'
                            },
                            justifyContent: 'flex-start',
                            flexDirection: 'row-reverse',
                            marginRight: '20px',

                        }}>
                            {pages.map((page) => (
                                <NavLink
                                    key={page.name}
                                    to={page.path}
                                    style={({ isActive }) => ({
                                        color: '#e9d0ab',
                                        textDecoration: 'none',
                                        margin: '0 10px',
                                        fontWeight: isActive ? 'bold' : 'normal',
                                        borderBottom: isActive ? '2px solid #e9d0ab' : 'none',
                                        padding: '0 15px'
                                    })}
                                >
                                    {page.name}
                                </NavLink>
                            ))}
                        </Box>

                        {/* אזור המשתמש */}
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="הגדרות משתמש">
                                <IconButton onClick={handleOpenUserMenu} sx={{
                                    p: 0,
                                    border: '2px solid #e9d0ab',
                                    '&:hover': { backgroundColor: 'rgba(233, 208, 171, 0.1)' }
                                }}>
                                    <Avatar sx={{ bgcolor: '#e9d0ab', color: '#658285' }}>
                                        {user ? `${user.firstName[0]}${user.lastName[0]}` : ''}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>

                            {/* תפריט המשתמש */}
                            <Popover
                                open={!!anchorElUser}
                                onClose={handleCloseUserMenu}
                                anchorEl={anchorElUser}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: '#658285',
                                        color: '#e9d0ab',
                                        border: '1px solid #e9d0ab'
                                    }
                                }}
                            >
                                {user ? (
                                    <UserCard closeUser={handleCloseUserMenu} />
                                ) : (
                                    <Login
                                        openRegister={handleOpenRegisterModal}
                                        closeLogin={handleCloseUserMenu}
                                    />
                                )}
                            </Popover>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* חלון הרשמה */}
            <RegisterModal open={showRegisterModal} onClose={handleCloseRegisterModal} />
        </Box>
    );
}
