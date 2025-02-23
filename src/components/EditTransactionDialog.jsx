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
import { updateTransaction } from '../api/transactionApi';
import dayjs from 'dayjs';

// הגדרת הקטגוריות לפי סוג העסקה
const categories = {
    income: ['משכורת', 'בונוס', 'השקעות', 'מתנה', 'אחר'],
    expense: ['מזון', 'דיור', 'תחבורה', 'בילויים', 'קניות', 'חשבונות', 'אחר']
};

export default function EditTransactionDialog({ open, onClose, transaction, onSuccess }) {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: dayjs(),
        type: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                description: transaction.description,
                date: dayjs(transaction.date),
                type: transaction.type
            });
        }
    }, [transaction]);

    const handleSubmit = async () => {
        if (!formData.amount || !formData.description) {
            setError('נא למלא את כל השדות');
            return;
        }

        try {
            await updateTransaction(transaction._id, {
                ...formData,
                date: formData.date.toISOString()
            });
            onSuccess();
            onClose();
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    if (!transaction) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { minWidth: '400px' }
            }}
        >
            <DialogTitle>
                עריכת {transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}
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
                    color={transaction.type === 'income' ? 'success' : 'error'}
                >
                    שמור
                </Button>
            </DialogActions>
        </Dialog>
    );
} 