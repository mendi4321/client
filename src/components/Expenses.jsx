import React, { useState, useEffect, useMemo } from 'react';
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
    ToggleButtonGroup,
    ToggleButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getTransactions, deleteTransaction } from "../api/transactionApi";
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';
import { PieChart } from '@mui/x-charts/PieChart';
import dayjs from 'dayjs';
import ExpensesChart from './ExpensesChart';
import { convertCurrency } from '../api/currencyApi';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

// מסך ההוצאות  
export default function Expenses() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState('month'); // אפשרויות: day, week, month, year
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        transactionId: null
    });
    const [selectedCurrency, setSelectedCurrency] = useState('ILS');
    const [convertedAmounts, setConvertedAmounts] = useState({});
    const [convertedTotal, setConvertedTotal] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    // העברנו את הפונקציה למעלה
    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode) {
            case 'ILS': return '₪';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return currencyCode;
        }
    };

    // העברנו את חישוב סך ההוצאות למעלה
    const totalExpenses = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const currencies = [
        { value: 'ILS', label: '₪ (שקל)' },
        { value: 'USD', label: '$ (דולר)' },
        { value: 'EUR', label: '€ (אירו)' }
    ];

    // טעינת ההוצאות
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
                setConvertedTotal(totalExpenses);
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

                const total = await convertCurrency(totalExpenses, 'ILS', selectedCurrency);
                setConvertedTotal(total);
            } catch (error) {
                console.error('Error converting amounts:', error);
            }
        };

        convertAmounts();
    }, [selectedCurrency, filteredTransactions, totalExpenses]);

    // טעינת ההוצאות
    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            // סינון רק של ההוצאות
            setTransactions(data.filter(t => t.type === 'expense'));
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

    // חישוב סכומים לפי קטגוריות עם המרת מטבע
    const expensesByCategory = filteredTransactions.reduce((acc, transaction) => {
        const category = transaction.category || 'אחר';
        const amount = selectedCurrency === 'ILS'
            ? Number(transaction.amount)
            : convertedAmounts[transaction._id] || Number(transaction.amount);
        acc[category] = (acc[category] || 0) + amount;
        return acc;
    }, {});

    // הכנת הנתונים לגרף
    const pieChartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
        id: index,
        value: amount,
        label: `${category}: ${getCurrencySymbol(selectedCurrency)}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        color: [
            '#f44336', // אדום
            '#ff9800', // כתום
            '#ffc107', // צהוב
            '#4caf50', // ירוק
            '#2196f3', // כחול
            '#9c27b0', // סגול
            '#795548', // חום
            '#607d8b', // אפור-כחול
            '#e91e63', // ורוד
        ][index % 9] // מחזוריות של 9 צבעים
    }));

    // פונקציה למחיקת עסקה
    const handleDeleteClick = (id) => {
        setDeleteDialog({
            open: true,
            transactionId: id
        });
    };

    // פונקציה לאישור מחיקת עסקה
    const handleDeleteConfirm = async () => {
        try {
            await deleteTransaction(deleteDialog.transactionId);
            await loadTransactions();
        } catch (err) {
            setError('שגיאה במחיקת העסקה');
            console.error(err);
        } finally {
            setDeleteDialog({ open: false, transactionId: null });
        }
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

    // מיון העסקאות לפי המצב הנוכחי
    const sortedTransactions = useMemo(() => {
        const transactionsToSort = [...filteredTransactions];

        if (sortConfig.key) {
            transactionsToSort.sort((a, b) => {
                if (sortConfig.key === 'date') {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }
                return 0;
            });
        }

        return transactionsToSort;
    }, [filteredTransactions, sortConfig]);

    // פונקציה לטיפול בבקשות מיון כשלוחצים על כותרת העמודה
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // סימן ויזואלי למצב המיון הנוכחי
    const getSortSymbol = (column) => {
        if (sortConfig.key !== column) return '';
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    // מסך ההוצאות
    return (
        <CacheProvider value={cacheRtl}>
            <Box sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                {/* בחירת מטבע */}
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

                {/* כותרת ההוצאות */}
                <Paper sx={{
                    p: 2, mb: 4,
                    bgcolor: '#ffebee',
                    textAlign: 'center',
                    borderRadius: '10px',
                    width: '50%',
                }}>
                    <Typography variant="h6">סך הוצאות ({dateRangeToDisplay()})</Typography>
                    <Typography variant="h4" sx={{ my: 2 }}>
                        {getCurrencySymbol(selectedCurrency)}
                        {convertedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<RemoveIcon />}
                        onClick={() => setShowAddDialog(true)}
                        sx={{
                            backgroundColor: '#f44336',
                            '&:hover': { backgroundColor: '#d32f2f' }
                        }}
                    >
                        הוסף הוצאה
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

                {/* טבלת ההוצאות - עם הפרדה לפי חודשים ומיון אינטראקטיבי */}
                <TableContainer component={Paper}
                    sx={{
                        backgroundColor: '#658285',
                        height: '50vh',
                        width: '75%',
                        margin: '20px auto'
                    }}>
                    <Table>
                        <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#658285', zIndex: 1 }}>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        color: '#e9d0ab',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        '&:hover': { opacity: 0.8 },
                                        fontWeight: sortConfig.key === 'date' ? 'bold' : 'normal',
                                        width: '175px'
                                    }}
                                    onClick={() => requestSort('date')}
                                >
                                    תאריך {getSortSymbol('date')}
                                </TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>תיאור</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>קטגוריה</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem' }}>סכום</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontSize: '1rem', width: '100px' }}>פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ backgroundColor: '#e9d0ab' }}>
                            {filteredTransactions.length > 0 ? (
                                (() => {
                                    // שימוש בעסקאות ממויינות
                                    const sorted = sortedTransactions;

                                    // רינדור עם כותרות חודשים
                                    const rows = [];
                                    let lastMonth = null;

                                    sorted.forEach(transaction => {
                                        const date = new Date(transaction.date);
                                        const month = date.getMonth();
                                        const year = date.getFullYear();
                                        const currentMonth = `${month}-${year}`;

                                        // הוספת כותרת חודש אם זהו חודש חדש
                                        if (currentMonth !== lastMonth) {
                                            const monthNames = [
                                                'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                                                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                                            ];

                                            lastMonth = currentMonth;
                                            rows.push(
                                                <TableRow
                                                    key={`month-${currentMonth}`}
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
                                                    <TableCell sx={{
                                                        position: 'sticky',
                                                        top: 45,
                                                        backgroundColor: '#658285',
                                                        zIndex: 1,
                                                        '& td': {
                                                            backgroundColor: '#658285',
                                                            color: '#e9d0ab',
                                                            fontWeight: 'bold',
                                                        }
                                                    }} colSpan={5} align="center">
                                                        {`${monthNames[month]} ${year}`}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }

                                        // הוספת שורת עסקה
                                        rows.push(
                                            <TableRow key={transaction._id}>
                                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{transaction.description}</TableCell>
                                                <TableCell>{transaction.category || '-'}</TableCell>
                                                <TableCell
                                                    sx={{
                                                        color: 'red',
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
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(transaction._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    });

                                    return rows;
                                })()
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                                        אין הוצאות בטווח הזמן שנבחר
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* אזור התרשימים - עוגה וגרף קו */}
                <Box sx={{
                    mt: 4,
                    width: '80%',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },  // טור במובייל, שורה במסך רגיל
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 3
                }}>
                    {/* תרשים עוגה */}
                    <Box sx={{
                        width: { xs: '100%', md: '50%' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <Typography
                            variant="h6"
                            align="center"
                            sx={{
                                mb: 2,
                                color: '#658285',
                                fontWeight: 'bold'
                            }}
                        >
                            התפלגות הוצאות לפי קטגוריות ({dateRangeToDisplay()})
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            backgroundColor: 'transparent'
                        }}>
                            <PieChart
                                series={[
                                    {
                                        data: pieChartData,
                                        highlightScope: { faded: 'global', highlighted: 'item' },
                                        paddingAngle: 2,
                                        innerRadius: 20,
                                        outerRadius: 140,
                                        cornerRadius: 4,
                                        startAngle: -90,
                                        endAngle: 270,
                                    },
                                ]}
                                width={700}
                                height={400}
                                margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                sx={{
                                    backgroundColor: 'transparent',
                                    '--ChartsLegend-rootSpacing': '10px',
                                    '--ChartsLegend-itemWidth': '100%',
                                    '--ChartsLegend-itemMarkSize': '10px',
                                    '--ChartsLegend-itemMarkBorderRadius': '5px',
                                    '& .MuiChartsLegend-mark': {
                                        borderRadius: '5px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                        transform: 'translate(30px, 0)',
                                    },
                                    '& .MuiChartsLegend-label': {
                                        fontSize: '0.9rem',
                                        fontWeight: 'medium',
                                        color: '#555555',
                                    },
                                    '& .MuiChartsLegend-item': {
                                        marginBottom: '4px',
                                    },
                                    '& .MuiChartsArc-root:hover': {
                                        filter: 'brightness(0.9)',
                                        cursor: 'pointer',
                                    },
                                    '& .MuiChartsArc-arc': {
                                        strokeWidth: 1,
                                        stroke: '#fff',
                                        transition: 'all 0.2s',
                                    },
                                    '& .MuiChartsArc-root:hover .MuiChartsArc-arc': {
                                        stroke: '#fff',
                                        strokeWidth: 2,
                                    },
                                    '& .MuiChartsArc-root:hover .MuiChartsArc-highlighted': {
                                        transform: 'scale(1.05)',
                                        transformOrigin: 'center',
                                    },
                                }}
                                slotProps={{
                                    legend: {
                                        direction: 'column',
                                        position: { vertical: 'middle', horizontal: 'right' },
                                        padding: 10,
                                        itemMarkWidth: 14,
                                        itemMarkHeight: 14,
                                        markGap: 8,
                                        itemGap: 10,
                                        labelStyle: {
                                            fontSize: 12,
                                            fontWeight: 500,
                                        },
                                    },
                                }}
                                tooltip={{
                                    trigger: 'item',
                                    formatter: (item) => {
                                        const category = item.category || item.label.split(':')[0];
                                        return {
                                            title: category,
                                            content: `${getCurrencySymbol(selectedCurrency)}${item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                                        };
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* תרשים קו */}
                    <Box sx={{
                        width: { xs: '100%', md: '50%' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <ExpensesChart
                            filteredTransactions={filteredTransactions}
                            dateRange={dateRange}
                            selectedCurrency={selectedCurrency}
                            getCurrencySymbol={getCurrencySymbol}
                            convertedAmounts={convertedAmounts}
                        />
                    </Box>
                </Box>

                {/* דילוג להוספת הוצאה */}
                <AddTransactionDialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    type="expense"
                    onSuccess={loadTransactions}
                />
                {/* דילוג לעריכת הוצאה */}
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
                            האם אתה בטוח שברצונך למחוק הוצאה זו?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setDeleteDialog({ open: false, transactionId: null })}
                            sx={{ color: '#658285' }}
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
            </Box>
        </CacheProvider>
    );
} 