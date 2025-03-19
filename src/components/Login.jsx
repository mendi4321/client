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
            reםלturn;
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
        <Box sx={{
            padding: '8px',
            backgroundColor: '#658285',
            borderRadius: '8px'
        }}>
            {/* שדות ההתחברות */}
            <Stack spacing={1}>
                {error && <Typography variant='h6' sx={{ color: '#f44336' }}>
                    {error}
                </Typography>}
                {/* שדה האימייל */}
                <TextField
                    label="Email"
                    variant="outlined"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#e9d0ab' },
                            '&:hover fieldset': { borderColor: '#e9d0ab' },
                            '&.Mui-focused fieldset': { borderColor: '#e9d0ab' }
                        },
                        '& .MuiInputLabel-root': { color: '#e9d0ab' },
                        '& .MuiInputBase-input': { color: '#e9d0ab' }
                    }}
                />
                {/* שדה הסיסמא */}
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#e9d0ab' },
                            '&:hover fieldset': { borderColor: '#e9d0ab' },
                            '&.Mui-focused fieldset': { borderColor: '#e9d0ab' }
                        },
                        '& .MuiInputLabel-root': { color: '#e9d0ab' },
                        '& .MuiInputBase-input': { color: '#e9d0ab' }
                    }}
                />
                {/* כפתור ההתחברות */}
                <Button
                    startIcon={<GoogleIcon />}
                    variant="contained"
                    size="small"
                    sx={{
                        backgroundColor: '#e9d0ab',
                        color: '#658285',
                        '&:hover': { backgroundColor: '#d4b78c' }
                    }}
                >
                    Google
                </Button>
                {/* כפתור ההתחברות */}
                <Button
                    startIcon={<LoginIcon />}
                    variant="contained"
                    size="small"
                    onClick={handleLogin}
                    disabled={loading}
                    sx={{
                        backgroundColor: '#e9d0ab',
                        color: '#658285',
                        '&:hover': { backgroundColor: '#d4b78c' }
                    }}
                >
                    Login
                </Button>
                {/* כפתור ההרשמה */}
                <Button
                    startIcon={<PersonIcon />}
                    variant="contained"
                    size="small"
                    onClick={props.openRegister}
                    disabled={loading}
                    sx={{
                        backgroundColor: '#e9d0ab',
                        color: '#658285',
                        '&:hover': { backgroundColor: '#d4b78c' }
                    }}
                >
                    Register
                </Button>
            </Stack>
        </Box>
    )
}


