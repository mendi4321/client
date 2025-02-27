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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styled, alpha } from '@mui/material/styles';

// הגדרת הקטגוריות לפי סוג העסקה
const categories = {
    income: ['משכורת', 'בונוס', 'השקעות', 'מתנה', 'אחר'],
    expense: ['מזון', 'דיור', 'תחבורה', 'בילויים', 'קניות', 'חשבונות', 'אחר']
};

// הגדרת הקטגוריות להוצאות
const expenseCategories = [
    'מזון',
    'דיור',
    'תחבורה',
    'בילויים',
    'קניות',
    'חשבונות',
    'בריאות',
    'חינוך',
    'אחר'
];

// דילוג להוספת עסקה    
export default function AddTransactionDialog({ open, onClose, type, onSuccess }) {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: dayjs(),
        type: type
    });
    const [error, setError] = useState('');
    const [category, setCategory] = useState('');
    // טעינת הסוג של העסקה
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            type: type
        }));
    }, [type]);
    // פונקציה לשמירת העסקה
    const handleSubmit = async () => {
        if (!formData.amount) {
            setError('נא להזין סכום');
            return;
        }
        try {
            await addTransaction({
                ...formData,
                type: type,
                category: type === 'expense' ? category : null,
                description: formData.description || '',
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
            setCategory('');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    // מסך ההוספת עסקה
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    minWidth: '400px',
                    backgroundColor: '#658285',
                    color: '#e9d0ab'
                }
            }}
            aria-labelledby="transaction-dialog-title"
            aria-describedby="transaction-dialog-description"
            aria-modal="true"
        >
            <DialogTitle
                id="transaction-dialog-title"
                sx={{ color: '#e9d0ab' }}
            >
                {type === 'income' ? 'הוספת הכנסה' : 'הוספת הוצאה'}
            </DialogTitle>
            <DialogContent
                id="transaction-dialog-description"
            >
                {/* שגיאה בהוספת עסקה */}
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                {/* שדות ההוספה */}
                <Stack spacing={3} sx={{ mt: 2 }}>
                    {/* שדה הסכום */}
                    <TextField
                        label="סכום"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        fullWidth
                        required
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
                    {/* שדה התיאור */}
                    <TextField
                        label="תיאור"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
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
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="תאריך"
                            value={formData.date}
                            onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                            sx={{ width: '100%' }}
                        />
                    </LocalizationProvider>
                    {type === 'expense' && (
                        <TextField
                            select
                            label="קטגוריה"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#e9d0ab' },
                                    '&:hover fieldset': { borderColor: '#e9d0ab' },
                                    '&.Mui-focused fieldset': { borderColor: '#e9d0ab' }
                                },
                                '& .MuiInputLabel-root': { color: '#e9d0ab' },
                                '& .MuiInputBase-input': { color: '#e9d0ab' }
                            }}
                        >
                            {expenseCategories.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </Stack>
            </DialogContent>
            {/* כפתורים לסגירת הדילוג ולשמירת העסקה */}
            <DialogActions>
                <Button
                    onClick={onClose}
                    aria-label="ביטול"
                    sx={{ color: '#e9d0ab' }}
                >
                    ביטול
                </Button>
                <Button
                    onClick={handleSubmit}
                    aria-label={`הוסף ${type === 'income' ? 'הכנסה' : 'הוצאה'}`}
                    variant="contained"
                    sx={{
                        backgroundColor: type === 'income' ? '#4caf50' : '#f44336',
                        '&:hover': {
                            backgroundColor: type === 'income' ? '#388e3c' : '#d32f2f'
                        }
                    }}
                >
                    הוסף
                </Button>
            </DialogActions>
        </Dialog>
    );
} 