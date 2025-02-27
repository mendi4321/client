import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, ToggleButtonGroup, ToggleButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { PieChart } from '@mui/x-charts/PieChart';
import { getTransactions, deleteTransaction } from "../api/transactionApi";
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';
import dayjs from 'dayjs';
import { convertCurrency } from '../api/currencyApi';

// מסך ההכנסות והוצאות
export default function IncomeExpenses() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [error, setError] = useState('');
    const [editTransaction, setEditTransaction] = useState(null);
    const [dateRange, setDateRange] = useState('month'); // אפשרויות: day, week, month, year
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        transactionId: null
    });
    const [selectedCurrency, setSelectedCurrency] = useState('ILS');
    const [convertedTotalIncome, setConvertedTotalIncome] = useState(0);
    const [convertedTotalExpenses, setConvertedTotalExpenses] = useState(0);
    const [convertedAmounts, setConvertedAmounts] = useState({});

    const currencies = [
        { value: 'ILS', label: '₪ (שקל)' },
        { value: 'USD', label: '$ (דולר)' },
        { value: 'EUR', label: '€ (אירו)' }
    ];

    // חישוב הסכומים המסוננים לפי טווח הזמן הנבחר - נעביר לפני ה-useEffect
    const filteredTotalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const filteredTotalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // טעינת העסקאות בטעינת הדף
    useEffect(() => {
        loadTransactions();
    }, []);

    // סינון עסקאות לפי טווח זמן
    useEffect(() => {
        filterTransactionsByDateRange();
    }, [transactions, dateRange]);

    // המרת סכומים כאשר המטבע משתנה
    useEffect(() => {
        const convertAmounts = async () => {
            if (selectedCurrency === 'ILS') {
                setConvertedTotalIncome(filteredTotalIncome);
                setConvertedTotalExpenses(filteredTotalExpenses);
                return;
            }

            try {
                const convertedIncome = await convertCurrency(filteredTotalIncome, 'ILS', selectedCurrency);
                const convertedExpenses = await convertCurrency(filteredTotalExpenses, 'ILS', selectedCurrency);

                setConvertedTotalIncome(convertedIncome);
                setConvertedTotalExpenses(convertedExpenses);
            } catch (error) {
                console.error('Error converting amounts:', error);
            }
        };

        convertAmounts();
    }, [selectedCurrency, filteredTotalIncome, filteredTotalExpenses]);

    // טעינת העסקאות
    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data);
        } catch (err) {
            setError('שגיאה בטעינת הנתונים');
            console.error(err);
        }
    };

    // פונקציה לסינון עסקאות לפי טווח הזמן שנבחר
    const filterTransactionsByDateRange = () => {
        const now = dayjs();
        let filtered;

        switch (dateRange) {
            case 'day':
                // סינון עסקאות מהיום
                filtered = transactions.filter(t =>
                    dayjs(t.date).format('DD/MM/YYYY') === now.format('DD/MM/YYYY')
                );
                break;
            case 'week':
                // סינון עסקאות מהשבוע האחרון
                const weekStart = now.subtract(7, 'day');
                filtered = transactions.filter(t =>
                    dayjs(t.date).isAfter(weekStart) || dayjs(t.date).isSame(weekStart, 'day')
                );
                break;
            case 'month':
                // סינון עסקאות מהחודש האחרון
                const monthStart = now.subtract(30, 'day');
                filtered = transactions.filter(t =>
                    dayjs(t.date).isAfter(monthStart) || dayjs(t.date).isSame(monthStart, 'day')
                );
                break;
            case 'year':
                // סינון עסקאות מהשנה האחרונה
                const yearStart = now.subtract(365, 'day');
                filtered = transactions.filter(t =>
                    dayjs(t.date).isAfter(yearStart) || dayjs(t.date).isSame(yearStart, 'day')
                );
                break;
            default:
                filtered = transactions;
                break;
        }

        setFilteredTransactions(filtered);
    };

    // פונקציה להוספת עסקה
    const handleAddClick = (type) => {
        setTransactionType(type);
        setShowAddDialog(true);
    };
    // פונקציה למחיקת עסקה
    const handleDeleteClick = (id) => {
        setDeleteDialog({
            open: true,
            transactionId: id
        });
    };
    // פונקציה למחיקת עסקה
    const handleDeleteConfirm = async () => {
        try {
            await deleteTransaction(deleteDialog.transactionId);
            await loadTransactions();
            setSnackbar({
                open: true,
                message: 'העסקה נמחקה בהצלחה',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'שגיאה במחיקת העסקה',
                severity: 'error'
            });
        } finally {
            setDeleteDialog({ open: false, transactionId: null });
        }
    };
    // פונקציה לסגירת הודעת snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    // חישוב סכומים כלליים - ללא סינון
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // הוספת פונקציה להצגת סמל המטבע
    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode) {
            case 'ILS': return '₪';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return currencyCode;
        }
    };

    // נוסיף useEffect להמרת הסכומים בטבלה
    useEffect(() => {
        const convertTableAmounts = async () => {
            if (selectedCurrency === 'ILS') {
                setConvertedAmounts({});
                return;
            }

            const converted = {};
            for (const transaction of filteredTransactions) {
                const amount = await convertCurrency(Number(transaction.amount), 'ILS', selectedCurrency);
                converted[transaction._id] = amount;
            }
            setConvertedAmounts(converted);
        };

        convertTableAmounts();
    }, [selectedCurrency, filteredTransactions]);

    // מסך ההכנסות והוצאות  
    return (
        <Box sx={{ p: 3 }}>
            {/* בחירת מטבע - העברנו לחלק העליון */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>מטבע</InputLabel>
                    <Select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        label="מטבע"
                    >
                        {currencies.map((currency) => (
                            <MenuItem key={currency.value} value={currency.value}>
                                {currency.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* הצגת הסכומים המומרים */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                    <Typography variant="h6">סך הכנסות</Typography>
                    <Typography variant="h4" sx={{ color: '#4caf50' }}>
                        {getCurrencySymbol(selectedCurrency)}
                        {convertedTotalIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Typography>
                </Paper>

                <Paper sx={{ p: 2, flex: 1, bgcolor: '#ffebee', textAlign: 'center' }}>
                    <Typography variant="h6">סך הוצאות</Typography>
                    <Typography variant="h4" sx={{ color: '#f44336' }}>
                        {getCurrencySymbol(selectedCurrency)}
                        {convertedTotalExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Typography>
                </Paper>

                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                    <Typography variant="h6">מאזן</Typography>
                    <Typography variant="h4" sx={{
                        color: convertedTotalIncome - convertedTotalExpenses >= 0 ? '#4caf50' : '#f44336'
                    }}>
                        {getCurrencySymbol(selectedCurrency)}
                        {(convertedTotalIncome - convertedTotalExpenses).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Typography>
                </Paper>
            </Stack>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            {/* טבלת עסקאות והגרף זה לצד זה */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                {/* טבלת עסקאות */}
                <Box sx={{ flex: 2 }}> {/* תופס 60% במסך גדול */}
                    <Typography
                        variant="h7"
                        sx={{
                            color: 'text.primary',
                            textAlign: 'center',
                            border: '5px solid #658285',
                            borderRadius: '10px',
                            backgroundColor: '#658285',
                            marginLeft: '40%',
                            padding: '5px',
                        }}>
                        עסקאות אחרונות
                    </Typography>
                    <TableContainer component={Box}
                        sx={{
                            backgroundColor: '#658285',
                            height: '75vh',
                        }}>
                        {/* טבלת העסקאות שמוצגת בטופס טבלה */}
                        <Table>
                            <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#658285', zIndex: 1 }}>
                                <TableRow >
                                    <TableCell sx={{ color: '#e9d0ab' }}>תאריך</TableCell>
                                    <TableCell sx={{ color: '#e9d0ab' }}>סוג</TableCell>
                                    <TableCell sx={{ color: '#e9d0ab' }}>תיאור</TableCell>
                                    <TableCell sx={{ color: '#e9d0ab' }}>קטגוריה</TableCell>
                                    <TableCell sx={{ color: '#e9d0ab' }}>סכום</TableCell>
                                    <TableCell sx={{ color: '#e9d0ab' }}>פעולות</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: '#e9d0ab' }}>
                                {/* בדיקה אם יש עסקאות להצגה */}
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        // טבלת העסקאות שמוצגת בטופס טבלה   
                                        <TableRow key={transaction._id}
                                            sx={{
                                                backgroundColor: '#e9d0ab',
                                                color: '#658285'
                                            }}>
                                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}</TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>{transaction.category || '-'}</TableCell>
                                            <TableCell
                                                sx={{
                                                    color: transaction.type === 'income' ? 'green' : 'red',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {getCurrencySymbol(selectedCurrency)}
                                                {(selectedCurrency === 'ILS'
                                                    ? Number(transaction.amount)
                                                    : convertedAmounts[transaction._id] || Number(transaction.amount)
                                                ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setEditTransaction(transaction)}
                                                    aria-label="עריכה"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(transaction._id)}
                                                    color="error"
                                                    aria-label="מחיקה"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            אין עסקאות להצגה בטווח הזמן שנבחר
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* גרף פאי להצגת הכנסות והוצאות */}
                <Box sx={{ flex: 2 }}> {/* תופס 40% במסך גדול */}
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                        התפלגות הכנסות והוצאות ({dateRangeToDisplay()})
                    </Typography>
                    <Box sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        height: 'calc(100% - 32px)',
                        marginLeft: '10%',
                        marginRight: '10%',
                    }}>
                        {/* גרף פאי להצגת הכנסות והוצאות */}
                        <PieChart
                            series={[
                                {
                                    data: [
                                        {
                                            id: 0,
                                            value: convertedTotalIncome || filteredTotalIncome,
                                            color: '#4caf50',
                                            label: 'הכנסות'
                                        },
                                        {
                                            id: 1,
                                            value: convertedTotalExpenses || filteredTotalExpenses,
                                            color: '#f44336',
                                            label: 'הוצאות'
                                        }
                                    ],
                                    type: 'pie',
                                    arcLabel: (item) => `${item.label}: ${item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${getCurrencySymbol(selectedCurrency)}`,
                                },
                            ]}
                            width={350}
                            height={350}
                            sx={{
                                backgroundColor: 'transparent'
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* טווח זמן לסינון */}
            <Box sx={{ color: '#658285', p: 2, mb: 3, textAlign: 'center', marginTop: 0 }}>
                {/* כותרת הטווח זמן להצגת נתונים */}
                <Typography variant="h6" gutterBottom>
                    בחר טווח זמן להצגת נתונים
                </Typography>
                <ToggleButtonGroup
                    value={dateRange}
                    exclusive
                    onChange={(e, newValue) => {
                        if (newValue) setDateRange(newValue);
                    }}
                    aria-label="טווח זמן"
                    sx={{ mt: 1 }}
                >
                    <ToggleButton value="day" aria-label="יום">
                        <CalendarViewDayIcon sx={{ mr: 1, color: '#e9d0ab' }} />
                        יום
                    </ToggleButton>
                    <ToggleButton value="week" aria-label="שבוע">
                        <ViewWeekIcon sx={{ mr: 1, color: '#e9d0ab' }} />
                        שבוע
                    </ToggleButton>
                    <ToggleButton value="month" aria-label="חודש">
                        <DateRangeIcon sx={{ mr: 1, color: '#e9d0ab' }} />
                        חודש
                    </ToggleButton>
                    <ToggleButton value="year" aria-label="שנה">
                        <CalendarMonthIcon sx={{ mr: 1, color: '#e9d0ab' }} />
                        שנה
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* דיאלוג הוספת עסקה */}
            <AddTransactionDialog
                open={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                type={transactionType}
                onSuccess={loadTransactions}
            />

            {/* דיאלוג עריכת עסקה */}
            <EditTransactionDialog
                open={!!editTransaction}
                onClose={() => setEditTransaction(null)}
                transaction={editTransaction}
                onSuccess={() => {
                    loadTransactions();
                    setEditTransaction(null);
                }}
            />

            {/* דיאלוג אישור מחיקה */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, transactionId: null })}
                PaperProps={{
                    sx: { minWidth: '400px' }
                }}
            >
                {/* כותרת הדיאלוג */}
                <DialogTitle>
                    אישור מחיקה
                </DialogTitle>
                {/* תוכן הדיאלוג */}
                <DialogContent>
                    <DialogContentText>
                        האם אתה בטוח שברצונך למחוק עסקה זו?
                    </DialogContentText>
                </DialogContent>
                {/* כפתורים הדיאלוג */}
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, transactionId: null })}
                        color="inherit"
                    >
                        ביטול
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                    >
                        מחק
                    </Button>
                </DialogActions>
            </Dialog>
            {/* הוספת Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {/* הוספת Snackbar */}
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );

    // פונקציה שמחזירה את טווח הזמן שנבחר לתצוגה בעברית
    function dateRangeToDisplay() {
        switch (dateRange) {
            case 'day':
                return 'היום';
            case 'week':
                return 'שבוע אחרון';
            case 'month':
                return 'חודש אחרון';
            case 'year':
                return 'שנה אחרונה';
            default:
                return '';
        }
    }
}
