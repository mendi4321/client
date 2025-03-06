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
import 'dayjs/locale/he'; // ייבוא לוקאל עברית

// הגדרת הקטגוריות לפי סוג העסקה
const categories = {
    income: ['משכורת', 'בונוס', 'השקעות', 'מתנה', 'אחר'],
    expense: ['מזון', 'דיור', 'תחבורה', 'בילויים', 'קניות', 'חשבונות', 'אחר']
};

// הוספת הקטגוריות
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

// דילוג לעריכת עסקה    
export default function EditTransactionDialog({ open, onClose, transaction, onSuccess }) {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: dayjs(),
        type: '',
        category: ''
    });
    const [error, setError] = useState('');
    // טעינת העסקה
    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                description: transaction.description,
                date: dayjs(transaction.date),
                type: transaction.type,
                category: transaction.category || ''
            });
        }
    }, [transaction]);
    // פונקציה לשמירת העסקה
    const handleSubmit = async () => {
        if (!formData.amount) {
            setError('נא להזין סכום');
            return;
        }

        try {
            await updateTransaction(transaction._id, {
                ...formData,
                description: formData.description || '',
                date: formData.date.toISOString()
            });
            onSuccess();
            onClose();
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    // מסך העריכת עסקה  
    if (!transaction) return null;
    // מסך העריכת עסקה      
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
            aria-modal="true"
        >
            {/* כותרת הדילוג */}
            <DialogTitle sx={{ color: '#e9d0ab' }}>
                עריכת {transaction?.type === 'income' ? 'הכנסה' : 'הוצאה'}
            </DialogTitle>
            {/* תוכן הדילוג */}
            <DialogContent>
                {/* שגיאה בעריכת עסקה */}
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                {/* שדות העריכה */}
                <Stack spacing={3} sx={{ mt: 2 }}>
                    {/* שדה הסכום */}
                    <TextField
                        label="סכום"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
                        <DatePicker
                            label="תאריך"
                            value={formData.date}
                            onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                            format="DD/MM/YYYY"
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#e9d0ab' },
                                    '&:hover fieldset': { borderColor: '#e9d0ab' },
                                    '&.Mui-focused fieldset': { borderColor: '#e9d0ab' }
                                },
                                '& .MuiInputLabel-root': { color: '#e9d0ab' },
                                '& .MuiInputBase-input': { color: '#e9d0ab' }
                            }}
                        />
                    </LocalizationProvider>
                    {/* שדה הקטגוריה */}
                    {transaction?.type === 'expense' && (
                        <TextField
                            select
                            label="קטגוריה"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                {/* כפתור לביטול */}
                <Button onClick={onClose} sx={{ color: '#e9d0ab' }}>
                    ביטול
                </Button>
                {/* כפתור לשמירת העסקה */}
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        backgroundColor: transaction?.type === 'income' ? '#4caf50' : '#f44336',
                        '&:hover': {
                            backgroundColor: transaction?.type === 'income' ? '#388e3c' : '#d32f2f'
                        }
                    }}
                >
                    {/* כפתור לשמירת העסקה */}
                    שמור
                </Button>
            </DialogActions>
        </Dialog>
    );
} 