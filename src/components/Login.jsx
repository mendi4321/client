import React, { useState, useContext } from 'react';
import { Box, Stack, TextField, Button, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/PersonAdd';
import GoogleIcon from '@mui/icons-material/Google';
import { UserContext } from './UserContext';
import { login } from '../api/users';
// מסך ההתחברות
export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { logUser } = useContext(UserContext);

    // פונקציה להתחברות
    const handleLogin = () => {
        if (loading) {
            return;
        }
        if (!email || !password) {
            return setError('Enter email and password');
        }
        setLoading(true);
        setError(null);
        login(email, password)
            .then(({ data, token }) => {
                logUser(data, token);
                props.closeLogin();
            }).catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }
    // מסך ההתחברות
    return (
        <Box sx={{ padding: '8px' }}>
            <Stack spacing={1}>
                {error && <Typography variant='h6' color='error'>
                    {error}
                </Typography>}
                <TextField
                    label="Email"
                    variant="outlined"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                {/* שדה סיסמה */}
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
                {/* כפתור גוגל */}
                <Button
                    startIcon={<GoogleIcon />}
                    variant="contained"
                    size="small">
                    Google
                </Button>
                {/* כפתור התחברות */}
                <Button
                    startIcon={<LoginIcon />}
                    variant="contained"
                    size="small"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    Login
                </Button>
                {/* כפתור הרשמה */}
                <Button
                    startIcon={<PersonIcon />}
                    variant="contained"
                    size="small"
                    onClick={props.openRegister}
                    disabled={loading}
                >
                    Register
                </Button>
            </Stack>
        </Box >
    )
}





