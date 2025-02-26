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
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// רשימת העמודים עם הנתיבים שלהם
const pages = [
    { name: 'בית', path: '/' },
    { name: 'עובר ושב', path: '/income-expenses' },
    { name: 'הכנסות', path: '/income' },
    { name: 'הוצאות', path: '/expenses' },
    { name: 'תזכורות', path: '/reminders' },
    { name: 'טיפים', path: '/tips' }
];

// ניהול מצב (State) של הקומפוננטה
export default function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

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

    const handleNavigation = (path) => {
        handleCloseNavMenu();
        navigate(path);
    };

    // סרגל הניווט העליון
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: '#658285' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* לוגו בצד שמאל - מוצג בכל המסכים */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <img src="public/logo.png" alt="logo" style={{ width: '50px', height: '50px' }} />
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
                                {/* תפריט נייד - פריטי התפריט */}
                                <MenuIcon />
                            </IconButton>
                            {/* תפריט נייד - פריטי התפריט */}
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
                                    <MenuItem key={page.name} onClick={() => handleNavigation(page.path)}>
                                        <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
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
                            {/* שם האפליקציה במרכז */}
                            בית בשליטה
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
                            {/* שם האפליקציה במרכז */}
                            בית בשליטה
                        </Typography>

                        {/* תפריט רגיל - מוצג במסכים גדולים */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', flexDirection: 'row' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {pages.map((page) => (
                                    <Button
                                        key={page.name}
                                        component={Link}
                                        to={page.path}
                                        sx={{
                                            color: '#e9d0ab',
                                            '&:hover': { backgroundColor: 'rgba(233, 208, 171, 0.1)' }
                                        }}
                                    >
                                        {page.name}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        {/* אזור המשתמש בצד ימין */}
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="הגדרות משתמש">
                                <IconButton onClick={handleOpenUserMenu} sx={{
                                    p: 0,
                                    border: '2px solid #e9d0ab',
                                    '&:hover': {
                                        backgroundColor: 'rgba(233, 208, 171, 0.1)'
                                    }
                                }}>
                                    {user ? (
                                        <Avatar sx={{
                                            bgcolor: '#e9d0ab',
                                            color: '#658285'
                                        }}>
                                            {user.firstName[0]}{user.lastName[0]}
                                        </Avatar>
                                    ) : (
                                        <Avatar sx={{
                                            bgcolor: '#e9d0ab',
                                            color: '#658285'
                                        }} />
                                    )}
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
                                PaperProps={{
                                    sx: {
                                        backgroundColor: '#658285',
                                        color: '#e9d0ab',
                                        border: '1px solid #e9d0ab',
                                        '& .MuiInputBase-input': {
                                            color: '#e9d0ab'
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#e9d0ab'
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#e9d0ab'
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#e9d0ab'
                                            }
                                        }
                                    }
                                }}
                            >
                                {/* בדיקה האם יש משתמש מחובר */}
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
            {/* חלון ההרשמה */}
            <RegisterModal open={showRegisterModal} onClose={handleCloseRegisterModal} />
        </Box>
    );
}