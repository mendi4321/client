import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    MenuItem,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { addTransaction } from '../api/transactionApi';
import dayjs from 'dayjs';

// הגדרת הקטגוריות לפי סוג העסקה
const categories = {
    income: ['משכורת', 'בונוס', 'השקעות', 'מתנה', 'אחר'],
    expense: ['מזון', 'דיור', 'תחבורה', 'בילויים', 'קניות', 'חשבונות', 'אחר']
};

export default function AddTransactionDialog({ open, onClose, type, onSuccess }) {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: dayjs(),
        type: type
    });
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            type: type
        }));
    }, [type]);

    const handleSubmit = async () => {
        if (!formData.amount || !formData.description) {
            setError('נא למלא את כל השדות');
            return;
        }
        try {
            await addTransaction({
                ...formData,
                type: type,
                date: formData.date.toISOString()
            });
            onSuccess();
            onClose();
            setFormData({
                amount: '',
                description: '',
                date: dayjs(),
                type: type
            });
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { minWidth: '400px' }
            }}
        >
            <DialogTitle>
                {type === 'income' ? 'הוספת הכנסה' : 'הוספת הוצאה'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                        label="סכום"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="תיאור"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="תאריך"
                            value={formData.date}
                            onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                            sx={{ width: '100%' }}
                        />
                    </LocalizationProvider>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    ביטול
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color={type === 'income' ? 'success' : 'error'}
                >
                    הוסף
                </Button>
            </DialogActions>
        </Dialog>
    );
} 