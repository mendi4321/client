import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, ToggleButtonGroup, ToggleButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

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
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

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

    // פונקציה לסינון עסקאות לפי טווח הזמן שנבחר - עם לוגיקה מתוקנת
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
                // סינון עסקאות מהשבוע הנוכחי (ראשון עד שבת)
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
            // המרת הסכומים לפי המטבע הנבחר בטבלה   
            const converted = {};
            for (const transaction of filteredTransactions) {
                const amount = await convertCurrency(Number(transaction.amount), 'ILS', selectedCurrency);
                converted[transaction._id] = amount;
            }
            setConvertedAmounts(converted);
        };
        convertTableAmounts();
    }, [selectedCurrency, filteredTransactions]);

    // פונקציה למיון התאריכים
    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    // מיון העסקאות לפי תאריך וארגון לפי חודשים
    const organizeTransactionsByMonth = () => {
        // מיון העסקאות לפי תאריך (מהישן לחדש אם ascending, או מהחדש לישן אם descending)
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


    // מסך ההכנסות והוצאות  
    return (
        <CacheProvider value={cacheRtl}>
            <Box sx={{ p: 3 }}>
                {/* הצגת הסכומים המומרים */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                    <Paper sx={{ p: 2, flex: 1, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                        <Typography variant="h6">סך הכנסות ({dateRangeToDisplay()})</Typography>
                        <Typography variant="h4" sx={{ color: '#4caf50' }}>
                            {getCurrencySymbol(selectedCurrency)}
                            {convertedTotalIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, flex: 1, bgcolor: '#ffebee', textAlign: 'center' }}>
                        <Typography variant="h6">סך הוצאות ({dateRangeToDisplay()})</Typography>
                        <Typography variant="h4" sx={{ color: '#f44336' }}>
                            {getCurrencySymbol(selectedCurrency)}
                            {convertedTotalExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                        <Typography variant="h6">מאזן ({dateRangeToDisplay()})</Typography>
                        <Typography variant="h4" sx={{
                            color: convertedTotalIncome - convertedTotalExpenses >= 0 ? '#4caf50' : '#f44336'
                        }}>
                            {getCurrencySymbol(selectedCurrency)}
                            {(convertedTotalIncome - convertedTotalExpenses).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </Typography>

                        {/* הוספת הערכה למאזן */}
                        <Box sx={{ mt: 1, p: 1, borderRadius: '4px', bgcolor: convertedTotalIncome - convertedTotalExpenses >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }}>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 'bold',
                                color: convertedTotalIncome - convertedTotalExpenses >= 0 ? '#4caf50' : '#f44336'
                            }}>
                                {convertedTotalIncome - convertedTotalExpenses >= 0
                                    ? 'מאזן חיובי - מצב טוב!'
                                    : 'מאזן שלילי - נדרש שיפור'}
                            </Typography>

                            {convertedTotalIncome - convertedTotalExpenses > 0 && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    ניתן לחסוך
                                </Typography>
                            )}

                            {convertedTotalIncome - convertedTotalExpenses < 0 && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    מומלץ לצמצם הוצאות
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Stack>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {/* אזור הסינון - בחירת טווח זמן ובחירת מטבע ממורכזים */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center', // שינוי מ-space-between ל-center
                    mb: 3,
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 3, md: 4 }, // הגדלת הרווח בין הרכיבים
                    alignItems: 'center' // מרכוז אנכי
                }}>
                    {/* טווח זמן לסינון */}
                    <Box sx={{
                        color: '#658285',
                        p: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center' // מרכוז בכל המסכים
                    }}>
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

                    {/* בחירת מטבע */}
                    <Box sx={{
                        p: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center' // מרכוז בכל המסכים
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#658285' }}>
                            בחר מטבע להצגת נתונים
                        </Typography>
                        <FormControl sx={{ minWidth: 150, mt: 1 }}>
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
                </Box>

                {/* טבלת עסקאות והגרף זה לצד זה */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* טבלת עסקאות */}
                    <Box sx={{ flex: 2, marginRight: '75px' }}> {/* תופס 60% במסך גדול */}
                        <Typography
                            variant="h7"
                            sx={{
                                color: '#fff9eb',
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
                                width: '60vw',
                            }}>
                            {/* טבלת העסקאות שמוצגת בטופס טבלה */}
                            <Table  >
                                <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#658285', zIndex: 1 }}>
                                    <TableRow  >
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
                                        <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>סוג</TableCell>
                                        <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>תיאור</TableCell>
                                        <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>קטגוריה</TableCell>
                                        <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>סכום</TableCell>
                                        <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem', width: '10px' }}>פעולות</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{ backgroundColor: '#e9d0ab' }}>
                                    {/* בדיקה אם יש עסקאות להצגה */}
                                    {organizedTransactions.length > 0 ? (
                                        organizedTransactions.map((item) => (
                                            item.isMonthHeader ? (
                                                // שורת כותרת החודש
                                                <TableRow
                                                    key={item.id}
                                                    sx={{
                                                        backgroundColor: '#658285',
                                                        '& td': {
                                                            color: '#e9d0ab',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.1rem',
                                                            borderBottom: '2px solid #e9d0ab',
                                                            py: 1
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ position: 'sticky', top: 45, backgroundColor: '#658285', zIndex: 1 }} colSpan={6} align="center">
                                                        {item.monthHeader}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                // שורת עסקה רגילה
                                                <TableRow key={item._id}
                                                    sx={{
                                                        backgroundColor: '#e9d0ab',
                                                        color: '#658285'
                                                    }}>
                                                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{item.type === 'income' ? 'הכנסה' : 'הוצאה'}</TableCell>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell>{item.category || '-'}</TableCell>
                                                    <TableCell
                                                        sx={{
                                                            color: item.type === 'income' ? 'green' : 'red',
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
                                                            aria-label="עריכה"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteClick(item._id)}
                                                            color="error"
                                                            aria-label="מחיקה"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )
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
                            display: 'flex',
                            justifyContent: 'center',
                            height: 'calc(100% - 32px)',
                            marginLeft: '10%',
                            marginRight: '10%',
                            position: 'relative',
                        }}>
                            {/* גרף פאי להצגת הכנסות והוצאות - עיצוב מודרני עם רקע שקוף */}
                            <PieChart
                                series={[
                                    {
                                        data: [
                                            {
                                                id: 0,
                                                value: convertedTotalIncome || filteredTotalIncome,
                                                color: '#4CAF50',
                                                label: 'הכנסות',
                                            },
                                            {
                                                id: 1,
                                                value: convertedTotalExpenses || filteredTotalExpenses,
                                                color: '#F44336',
                                                label: 'הוצאות',
                                            }
                                        ],
                                        type: 'pie',
                                        innerRadius: 30,
                                        outerRadius: 120,
                                        paddingAngle: 2,
                                        cornerRadius: 4,
                                        startAngle: -90,
                                        endAngle: 270,
                                        cx: 175,
                                        cy: 175,
                                        highlightScope: { faded: 'global', highlighted: 'item' },
                                        faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                        arcLabel: (item) => `${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${getCurrencySymbol(selectedCurrency)}`,
                                        arcLabelMinAngle: 20,
                                    },
                                ]}
                                width={350}
                                height={350}
                                margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                slotProps={{
                                    legend: {
                                        direction: 'row',
                                        position: { vertical: 'bottom', horizontal: 'middle' },
                                        padding: 0,
                                        labelStyle: {
                                            fontSize: 14,
                                            fontWeight: 'bold',
                                            fill: '#333',
                                            transform: 'translate(0, 10px)',
                                        },
                                    },
                                    svg: {
                                        style: {
                                            backgroundColor: 'transparent',
                                        }
                                    }
                                }}
                                sx={{
                                    backgroundColor: 'transparent',
                                    '& .MuiChartsLegend-root': {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '24px',
                                        marginTop: '16px',
                                    },
                                    '& .MuiChartsLegend-label': {
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiChartsLegend-mark': {
                                        borderRadius: '50%',
                                        width: '12px',
                                        height: '12px',
                                    },
                                    '& text': {
                                        fill: '#333',
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem',
                                    },
                                }}
                            />
                        </Box>
                    </Box>
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
                    <DialogTitle sx={{ backgroundColor: '#fff9eb' }}>
                        אישור מחיקה
                    </DialogTitle>
                    {/* תוכן הדיאלוג */}
                    <DialogContent sx={{ backgroundColor: '#fff9eb' }}>
                        <DialogContentText>
                            האם אתה בטוח שברצונך למחוק עסקה זו?
                        </DialogContentText>
                    </DialogContent>
                    {/* כפתורים הדיאלוג */}
                    <DialogActions sx={{ backgroundColor: '#658285' }}>
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
        </CacheProvider>
    );

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
}
