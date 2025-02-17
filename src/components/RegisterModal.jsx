import { useState } from 'react';
import { Modal, Box, Typography, Button, Stack, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


const userKeys = ['firstname', 'lastname', 'email', 'password', 'birthDate'];

export default function RegisterModal(props) {
    const [userInfo, setUserInfo] = useState({});
    const [error, setError] = useState({});

    const handleChange = (event) => {
        const key = event.target.name;
        const value = event.target.value;
        setUserInfo({ ...userInfo, [key]: value });
    };
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
    const onRegisterClick = () => {
        const noErrors = checkError();
        if (!noErrors) {
            return;
        }
        console.log(userInfo);
        //נעשה את זה בהמשך
    }


    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Box sx={{
                padding: '8px',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                bgcolor: 'background.paper',
                boxShadow: 24,
            }}>
                <Stack spacing={2}>
                    <TextField
                        required
                        name='firstname'
                        variant='outlined'
                        label='First Name'
                        size='small'
                        value={userInfo.firstname || ''}
                        onChange={handleChange}
                        error={!!error.firstname}
                        helperText={error.firstname || null}
                    />
                    <TextField
                        required
                        name='lastname'
                        variant='outlined'
                        label='name'
                        size='small'
                        value={userInfo.lastname || ''}
                        onChange={handleChange}
                        error={!!error.lastname}
                        helperText={error.lastname || null}
                    />
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
                    />
                    <BirthDatePicker
                        value={userInfo.birthDate || null}
                        onChange={handleChange}
                        error={!!error.birthDate}
                    />
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
                    />
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
                    <Button variant='contained' size='small'
                        onClick={onRegisterClick}>
                        Register
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}

function BirthDatePicker(props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label='Birthday'
                value={props.value}
                onChange={value => props.onChange({ target: { name: 'birthDate', value } })}
                error={!!props.error}
                helperText={props.error || null}
                size='small'
            />
        </LocalizationProvider>
    );
}