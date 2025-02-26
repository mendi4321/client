import { useState } from 'react';
import { Modal, Box, Typography, Button, Stack, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { register } from '../api/users';
import { useContext } from 'react';
import { UserContext } from './UserContext';

// מספר המשתמש המחובר
const userKeys = ['firstName', 'lastName', 'email', 'password', 'birthday'];
// מסך ההרשמה
export default function RegisterModal(props) {
    const [userInfo, setUserInfo] = useState({});
    const [error, setError] = useState({});
    const [serverError, setServerError] = useState('');
    const [Loaging, setLoaging] = useState(false);
    const { logUser } = useContext(UserContext);
    // פונקציה שמכילה את המשתנים של המשתמש והטוקן
    const handleChange = (event) => {
        const key = event.target.name;
        const value = event.target.value;
        setUserInfo({ ...userInfo, [key]: value });
    };
    // פונקציה שמכילה את השגיאות של המשתמש והטוקן
    const checkError = () => {
        const errorsOdiect = {};
        let success = true;
        for (let key of userKeys) {
            if (!userInfo[key]) {
                errorsOdiect[key] = 'This field is required';
                success = false;
            }
        }
        if (!errorsOdiect.email && !userInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errorsOdiect.email = 'Bad email ';
            success = false;
        }
        if (!errorsOdiect.password && userInfo.password != userInfo.confirmPassword) {
            errorsOdiect.confirmPassword = 'Unmatched password';
            success = false;
        }
        setError(errorsOdiect);
        return success;
    }
    // פונקציה שמכילה את המשתמש והטוקן
    const onRegisterClick = () => {
        if (Loaging)
            return;
        setServerError('');
        setLoaging(true);
        const noErrors = checkError();
        if (!noErrors) {
            setLoaging(false)
            return;
        }
        const user = {};
        for (let key of userKeys) {
            user[key] = userInfo[key];
        }
        register(user)
            .then(({ data, token }) => {
                logUser(data, token);
                props.onClose();
            })
            .catch((error) => {
                setServerError(error.message);
            }).finally(() => {
                setLoaging(false);
            });
    }

    // מסך ההרשמה
    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Box sx={{
                padding: '8px',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                bgcolor: '#658285',
                boxShadow: 24,
                borderRadius: '8px',
                p: 4
            }}>
                <Stack spacing={2}>
                    {/* שדה השם הפרטי */}
                    <TextField
                        required
                        name='firstName'
                        variant='outlined'
                        label='First Name'
                        size='small'
                        value={userInfo.firstName || ''}
                        onChange={handleChange}
                        error={!!error.firstName}
                        helperText={error.firstname || null}
                        disabled={Loaging}
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
                    {/* שדה השם האחרון */}
                    <TextField
                        required
                        name='lastName'
                        variant='outlined'
                        label='Last Name'
                        size='small'
                        value={userInfo.lastName || ''}
                        onChange={handleChange}
                        error={!!error.lastName}
                        helperText={error.lastname || null}
                        disabled={Loaging}
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
                    {/* שדה האימייל */}
                    <TextField
                        required
                        name='email'
                        variant='outlined'
                        label='Email'
                        size='small'
                        value={userInfo.email || ''}
                        onChange={handleChange}
                        error={!!error.email}
                        helperText={error.email || null}
                        disabled={Loaging}
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
                    {/* שדה התאריך */}
                    <BirthDatePicker
                        value={userInfo.birthday || null}
                        onChange={handleChange}
                        error={!!error.birthday}
                        disabled={Loaging}
                    />
                    {/* שדה הסיסמא */}
                    <TextField
                        required
                        name='password'
                        variant='outlined'
                        label='Password'
                        size='small'
                        type='password'
                        value={userInfo.password || ''}
                        onChange={handleChange}
                        error={!!error.password}
                        helperText={error.password || null}
                        disabled={Loaging}
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
                    {/* שדה האימות של הסיסמא */}
                    <TextField
                        required
                        name='confirmPassword'
                        variant='outlined'
                        label='Confirm Password'
                        size='small'
                        type='password'
                        value={userInfo.confirmPassword || ''}
                        onChange={handleChange}
                        error={!!error.confirmPassword}
                        helperText={error.confirmPassword || null}
                        disabled={Loaging}
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
                    {/* <TextField
                        required
                        name='googleId'
                        variant='outlined'
                        label='Google ID'
                        size='small'
                        value={userInfo.googleId || ''}
                        onChange={handleChange}
                        error={!!error.googleId}
                        helperText={error.googleId || null}
                    /> */}
                    {/* כפתור ההרשמה */}
                    <Button
                        variant='contained'
                        size='small'
                        onClick={onRegisterClick}
                        disabled={Loaging}
                        sx={{
                            backgroundColor: '#e9d0ab',
                            color: '#658285',
                            '&:hover': { backgroundColor: '#d4b78c' }
                        }}
                    >
                        Register
                    </Button>
                    {/* שגיאה בהרשמה */}
                    {serverError && (
                        <Typography variant='h6' sx={{ color: '#f44336' }}>
                            {serverError}
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Modal>
    );
}
// פונקציה שמכילה את המשתמש והטוקן
function BirthDatePicker(props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label='Birthday'
                value={props.value}
                onChange={value => props.onChange({ target: { name: 'birthday', value } })}
                error={!!props.error}
                helperText={props.error || null}
                size='small'
                disabled={props.disabled}
            />
        </LocalizationProvider>
    );
}