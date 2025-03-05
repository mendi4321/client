import { Box, Typography, Button, Stack } from '@mui/material';
import { UserContext } from './UserContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
//כרטיס המשתמש
export default function UserCard(props) {
    const { user, unlogUser } = useContext(UserContext);
    const navigate = useNavigate();
    //אם אין משתמש מחזיר null
    if (!user) return null;
    //הפונקציה המונעת את התנתקות המשתמש
    const handleLogout = () => {
        unlogUser();
        navigate('/');
        if (props.onClose) {
            props.onClose();
        }
    }
    //הצגת הכרטיס
    return (
        <Box sx={{
            padding: '16px',
            minWidth: '200px',
            backgroundColor: '#658285',
            color: '#e9d0ab'
        }}>
            <Stack spacing={2}>
                <Typography variant="h7" sx={{ color: '#e9d0ab', fontSize: '20px' }}>
                    שלום: {user.firstName + ' ' + user.lastName}
                </Typography>
                <Typography sx={{ color: '#e9d0ab', fontSize: '20px' }}>
                    אימייל: {user.email}
                </Typography>
                <Button
                    startIcon={<LogoutIcon />}
                    variant="contained"
                    onClick={handleLogout}
                    sx={{
                        backgroundColor: '#e9d0ab',
                        color: '#658285',
                        '&:hover': {
                            backgroundColor: '#d4b78c'
                        }
                    }}
                >
                    התנתק
                </Button>
            </Stack>
        </Box>
    );
}