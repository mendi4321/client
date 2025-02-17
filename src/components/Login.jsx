import React, { useState } from 'react';
import { Box, Stack, TextField, Button } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/PersonAdd';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = () => {
        console.log(email, password);
    }
    return (
        <Box sx={{ padding: '8px' }}>
            <Stack spacing={1}>
                <TextField label="Email" variant="outlined" size="small" value={email}
                    onChange={(e) => setEmail(e.target.value)} />

                <TextField label="Password" variant="outlined" type="password" size="small" value={password}
                    onChange={(e) => setPassword(e.target.value)} />

                <Button startIcon={<GoogleIcon />} variant="contained" size="small">
                    Google
                </Button>
                <Button startIcon={<LoginIcon />} variant="contained" size="small" onClick={handleLogin}>
                    Login
                </Button>
                <Button startIcon={<PersonIcon />} variant="contained" size="small"
                    onClick={props.openRegister}>
                    Register
                </Button>
            </Stack>
        </Box >
    )
}





