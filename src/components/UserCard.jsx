import { Box, Typography, Button, Stack } from '@mui/material';
import { UserContext } from './UserContext';
import { useContext } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';

// כרטיס המשתמש
export default function UserCard(props) {
    const { user, unlogUser } = useContext(UserContext);
    if (!user) return null;
    const handleLogout = () => {
        unlogUser();
        props.CloseCser();
    }
    return (
        <Box sx={{ padding: '8px' }}>
            <Stack direction='row' spacing={2}>
                <Typography variant='h6' align='center'>
                    Hello {user.firstName}
                </Typography>
                <Typography variant='subtitle2' align='center'>
                    {user.email}
                </Typography>
                <Button variant='contained' onClick={handleLogout}>
                    logout
                </Button>
            </Stack>
        </Box>
    )
}