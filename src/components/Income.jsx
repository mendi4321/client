import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getTransactions, deleteTransaction } from '../api/transactionApi';
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';
import dayjs from 'dayjs';
import { convertCurrency } from '../api/currencyApi';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

// מסך ההכנסות
export default function Income() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        transactionId: null
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState('month'); // אפשרויות: day, week, month, year
    const [selectedCurrency, setSelectedCurrency] = useState('ILS');
    const [convertedAmounts, setConvertedAmounts] = useState({});
    const [convertedTotal, setConvertedTotal] = useState(0);
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc' for date sorting

    const currencies = [
        { value: 'ILS', label: '₪ (שקל)' },
        { value: 'USD', label: '$ (דולר)' },
        { value: 'EUR', label: '€ (אירו)' }
    ];

    // טעינת ההכנסות
    useEffect(() => {
        loadTransactions();
    }, []);

    // סינון עסקאות לפי טווח זמן
    useEffect(() => {
        filterTransactionsByDateRange();
    }, [transactions, dateRange]);

    // טעינת ההכנסות
    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            // סינון רק של ההכנסות
            setTransactions(data.filter(t => t.type === 'income'));
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
                // סינון עסקאות מהיום בלבד
                filtered = transactions.filter(t =>
                    dayjs(t.date).format('DD/MM/YYYY') === now.format('DD/MM/YYYY')
                );
                break;

            case 'week':
                // סינון עסקאות מהשבוע הנוכחי
                const startOfWeek = now.startOf('week');
                const endOfWeek = now.endOf('week');

                filtered = transactions.filter(t => {
                    const txDate = dayjs(t.date);
                    return (txDate.isAfter(startOfWeek) || txDate.isSame(startOfWeek, 'day')) &&
                        (txDate.isBefore(endOfWeek) || txDate.isSame(endOfWeek, 'day'));
                });
                break;

            case 'month':
                // סינון עסקאות מהחודש הנוכחי
                const startOfMonth = now.startOf('month');
                const endOfMonth = now.endOf('month');

                filtered = transactions.filter(t => {
                    const txDate = dayjs(t.date);
                    return (txDate.isAfter(startOfMonth) || txDate.isSame(startOfMonth, 'day')) &&
                        (txDate.isBefore(endOfMonth) || txDate.isSame(endOfMonth, 'day'));
                });
                break;

            case 'year':
                // סינון עסקאות מהשנה הנוכחית
                const startOfYear = now.startOf('year');
                const endOfYear = now.endOf('year');

                filtered = transactions.filter(t => {
                    const txDate = dayjs(t.date);
                    return (txDate.isAfter(startOfYear) || txDate.isSame(startOfYear, 'day')) &&
                        (txDate.isBefore(endOfYear) || txDate.isSame(endOfYear, 'day'));
                });
                break;

            default:
                filtered = transactions;
                break;
        }

        setFilteredTransactions(filtered);
    };

    // סינון רק של ההכנסות המסוננות לפי הטווח שנבחר
    const totalIncome = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // פונקציה לפתיחת דיאלוג המחיקה
    const handleDeleteClick = (id) => {
        if (!id) {
            setSnackbar({
                open: true,
                message: 'שגיאה: מזהה העסקה חסר',
                severity: 'error'
            });
            return;
        }
        setDeleteDialog({
            open: true,
            transactionId: id
        });
    };

    // פונקציה למחיקת העסקה
    const handleDeleteConfirm = async () => {
        try {
            const { transactionId } = deleteDialog;
            if (!transactionId) {
                throw new Error('מזהה העסקה חסר');
            }

            await deleteTransaction(transactionId);
            await loadTransactions();
            setSnackbar({
                open: true,
                message: 'ההכנסה נמחקה בהצלחה',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error deleting transaction:', err);

            setSnackbar({
                open: true,
                message: 'שגיאה במחיקת ההכנסה',
                severity: 'error'
            });
        } finally {
            setDeleteDialog({ open: false, transactionId: null });
        }
    };

    // פונקציה לסגירת ההודעה
    const handleCloseSnackbar = () => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    };

    // פונקציה שמחזירה את טווח הזמן שנבחר לתצוגה בעברית
    function dateRangeToDisplay() {
        switch (dateRange) {
            case 'day':
                return 'היום';
            case 'week':
                return 'השבוע הנוכחי';
            case 'month':
                return 'החודש הנוכחי';
            case 'year':
                return 'השנה הנוכחית';
            default:
                return '';
        }
    }

    // המרת סכומים כאשר המטבע משתנה
    useEffect(() => {
        const convertAmounts = async () => {
            if (selectedCurrency === 'ILS') {
                setConvertedTotal(totalIncome);
                setConvertedAmounts({});
                return;
            }

            try {
                const converted = {};
                for (const transaction of filteredTransactions) {
                    const amount = await convertCurrency(Number(transaction.amount), 'ILS', selectedCurrency);
                    converted[transaction._id] = amount;
                }
                setConvertedAmounts(converted);

                const total = await convertCurrency(totalIncome, 'ILS', selectedCurrency);
                setConvertedTotal(total);
            } catch (error) {
                console.error('Error converting amounts:', error);
            }
        };

        convertAmounts();
    }, [selectedCurrency, filteredTransactions, totalIncome]);

    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode) {
            case 'ILS': return '₪';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return currencyCode;
        }
    };

    // פונקציה למיון התאריכים
    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    // מיון ההכנסות לפי תאריך
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection === 'asc'
            ? dateA - dateB
            : dateB - dateA;
    });

    // פונקציה לארגון ההכנסות לפי חודשים
    const organizeTransactionsByMonth = () => {
        // מיון העסקאות לפי תאריך
        const sorted = [...filteredTransactions].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // ארגון העסקאות עם כותרות חודש
        const organized = [];
        let currentMonth = null;

        sorted.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionMonth = `${transactionDate.getMonth() + 1}-${transactionDate.getFullYear()}`;

            // אם הגענו לחודש חדש, נוסיף כותרת חודש
            if (currentMonth !== transactionMonth) {
                currentMonth = transactionMonth;

                // שם החודש בעברית
                const monthNames = [
                    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                ];

                const monthName = monthNames[transactionDate.getMonth()];
                const year = transactionDate.getFullYear();

                organized.push({
                    id: `month-${transactionMonth}`,
                    isMonthHeader: true,
                    monthHeader: `${monthName} ${year}`
                });
            }

            organized.push(transaction);
        });

        return organized;
    };

    const organizedTransactions = organizeTransactionsByMonth();

    // מסך ההכנסות
    return (
        <CacheProvider value={cacheRtl}>
            <Box sx={{ p: 3 }}>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {/* בחירת מטבע - העברנו למעלה */}
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

                {/* כרטיס סך הכנסות */}
                <Paper sx={{
                    p: 2,
                    mb: 4,
                    bgcolor: '#e8f5e9',
                    textAlign: 'center',
                    borderRadius: '10px',
                    width: '50%',
                    margin: '0 auto'
                }}>
                    <Typography variant="h6">סך הכנסות ({dateRangeToDisplay()})</Typography>
                    <Typography variant="h4" sx={{ my: 2 }}>
                        {getCurrencySymbol(selectedCurrency)}
                        {convertedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowAddDialog(true)}
                        sx={{
                            backgroundColor: '#4caf50',
                            '&:hover': { backgroundColor: '#388e3c' }
                        }}
                    >
                        הוסף הכנסה
                    </Button>
                </Paper>

                {/* טווח זמן לסינון */}
                <Box sx={{ color: '#658285', p: 2, mb: 3, textAlign: 'center' }}>
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

                {/* טבלת ההכנסות */}
                <TableContainer component={Paper}
                    sx={{
                        backgroundColor: '#658285',
                        height: '50vh',
                        width: '75vw',
                        margin: '0 auto'
                    }}>
                    <Table>
                        <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#658285', zIndex: 1 }}>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        color: '#e9d0ab',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                    onClick={toggleSortDirection}
                                >
                                    תאריך {sortDirection === 'asc' ? '↑' : '↓'}
                                </TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>תיאור</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>סכום</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem', width: '100px' }}>פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ backgroundColor: '#e9d0ab' }}>
                            {organizedTransactions.length > 0 ? (
                                organizedTransactions.map((item) => (
                                    item.isMonthHeader ? (
                                        // שורת כותרת החודש
                                        <TableRow

                                            key={item.id}
                                            sx={{
                                                backgroundColor: '#658285',
                                                '& td': {
                                                    backgroundColor: '#658285',
                                                    color: '#e9d0ab',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    borderBottom: '2px solid #e9d0ab',
                                                    py: 1,

                                                    position: 'sticky',
                                                    top: 45,
                                                    zIndex: 1,
                                                }
                                            }}
                                        >
                                            <TableCell colSpan={4} align="center">
                                                {item.monthHeader}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        // שורת עסקה רגילה
                                        <TableRow key={item._id}>
                                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell
                                                sx={{
                                                    color: 'green',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {getCurrencySymbol(selectedCurrency)}
                                                {(selectedCurrency === 'ILS'
                                                    ? Number(item.amount)
                                                    : convertedAmounts[item._id] || Number(item.amount)
                                                ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setEditTransaction(item)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(item._id)}
                                                    disabled={!item._id}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                                        אין הכנסות בטווח הזמן שנבחר
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* דילוג להוספת הכנסה */}
                <AddTransactionDialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    type="income"
                    onSuccess={loadTransactions}
                />
                {/* דילוג לעריכת הכנסה */}
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
                    aria-modal="true"
                    role="alertdialog"
                    sx={{
                        '& .MuiDialog-paper': {
                            backgroundColor: '#e9d0ab',
                            color: '#658285'
                        }
                    }}
                >
                    <DialogTitle>אישור מחיקה</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            האם אתה בטוח שברצונך למחוק הכנסה זו?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setDeleteDialog({ open: false, transactionId: null })}
                            aria-label="ביטול מחיקת הכנסה"
                        >
                            ביטול
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            color="error"
                            variant="contained"
                            aria-label="אישור מחיקת הכנסה"
                        >
                            מחק
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* הודעות למשתמש */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </CacheProvider>
    );
} 