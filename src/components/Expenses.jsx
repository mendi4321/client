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
                return 'שבוע אחרון';
            case 'month':
                return 'חודש אחרון';
            case 'year':
                return 'שנה אחרונה';
            default:
                return '';
        }
    }

    // מסך ההוצאות
    return (
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

            {/* טבלת ההוצאות */}
            <TableContainer component={Paper}
                sx={{
                    width: '75%',
                    bgcolor: '#658285',
                    height: '50vh',
                    mb: 4,
                    borderRadius: '8px',
                    boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                    overflow: 'auto'
                }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    backgroundColor: '#658285',
                                    color: '#e9d0ab',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #e9d0ab'
                                }}
                            >
                                תאריך
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#658285',
                                    color: '#e9d0ab',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #e9d0ab'
                                }}
                            >
                                תיאור
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#658285',
                                    color: '#e9d0ab',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #e9d0ab'
                                }}
                            >
                                סכום
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#658285',
                                    color: '#e9d0ab',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #e9d0ab'
                                }}
                            >
                                קטגוריה
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#658285',
                                    color: '#e9d0ab',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    borderBottom: '2px solid #e9d0ab'
                                }}
                            >
                                פעולות
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ backgroundColor: '#e9d0ab' }}>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
                                <TableRow
                                    key={transaction._id}
                                    sx={{
                                        backgroundColor: '#e9d0ab',
                                        '&:hover': { backgroundColor: '#d9c09b' },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        {transaction.description}
                                    </TableCell>
                                    <TableCell sx={{
                                        textAlign: 'center',
                                        color: '#f44336',
                                        fontWeight: 'bold'
                                    }}>
                                        {getCurrencySymbol(selectedCurrency)}
                                        {(selectedCurrency === 'ILS'
                                            ? Number(transaction.amount)
                                            : convertedAmounts[transaction._id] || Number(transaction.amount)
                                        ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                                            <CategoryIcon sx={{ color: '#658285', fontSize: 20 }} />
                                            {transaction.category || 'לא מוגדר'}
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => setEditTransaction(transaction)}
                                            sx={{
                                                mr: 1,
                                                color: '#658285',
                                                '&:hover': { color: '#4a656d' }
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(transaction._id)}
                                            sx={{
                                                color: '#f44336',
                                                '&:hover': { color: '#d32f2f' }
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="subtitle1">
                                        אין הוצאות להצגה בטווח הזמן שנבחר
                                    </Typography>
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
                    <ExpensesChart />
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
    );
} 