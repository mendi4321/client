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
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import { getTransactions, deleteTransaction } from "../api/transactionApi";
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';
import { PieChart } from '@mui/x-charts/PieChart';

// מסך ההוצאות  
export default function Expenses() {
    const [transactions, setTransactions] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const [error, setError] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        transactionId: null
    });

    // טעינת ההוצאות
    useEffect(() => {
        loadTransactions();
    }, []);

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

    // סינון רק של ההוצאות      
    const totalExpenses = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // חישוב סכומים לפי קטגוריות
    const expensesByCategory = transactions.reduce((acc, transaction) => {
        const category = transaction.category || 'אחר';
        acc[category] = (acc[category] || 0) + Number(transaction.amount);
        return acc;
    }, {});

    // הכנת הנתונים לגרף
    const pieChartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
        id: index,
        value: amount,
        label: category,
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

    // מסך ההוצאות
    return (
        <Box sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            // height: '20%',
        }}>
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            {/* כותרת ההוצאות */}
            <Paper sx={{
                p: 2, mb: 4,
                bgcolor: '#ffebee',
                textAlign: 'center',
                borderRadius: '10px',
                width: '50%',
            }}>
                <Typography variant="h6">סך כל ההוצאות</Typography>
                <Typography variant="h4" sx={{ my: 2 }}>
                    ₪{totalExpenses.toLocaleString()}
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
            {/* טבלת ההוצאות */}
            <TableContainer component={Paper}
                sx={{
                    width: '75%',
                    bgcolor: '#658285',
                    height: '50vh',
                }}>
                <Table>
                    <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#658285', zIndex: 1 }}>
                        <TableRow >
                            <TableCell sx={{ color: '#e9d0ab' }}>תאריך</TableCell>
                            <TableCell sx={{ color: '#e9d0ab' }}>תיאור</TableCell>
                            <TableCell sx={{ color: '#e9d0ab' }}>סכום</TableCell>
                            <TableCell sx={{ color: '#e9d0ab' }}>קטגוריה</TableCell>
                            <TableCell sx={{ color: '#e9d0ab' }}>פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction._id}
                                sx={{
                                    backgroundColor: '#e9d0ab',
                                }}
                            >
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>₪{Number(transaction.amount).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <CategoryIcon sx={{ color: '#658285', fontSize: 20 }} />
                                        {transaction.category || 'לא מוגדר'}
                                    </Stack>
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
                                        onClick={() => handleDeleteClick(transaction._id)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
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

            {/* הוספת הגרף */}
            <Box sx={{ mt: 4, width: '100%' }}>
                <Typography
                    variant="h6"
                    align="center"
                    sx={{
                        mb: 2,
                        color: '#658285',
                        fontWeight: 'bold'
                    }}
                >
                    התפלגות הוצאות לפי קטגוריות
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
                                arcLabel: (item) => `${item.label}: ${item.value.toLocaleString()} ₪`,
                            },
                        ]}
                        width={350}
                        height={350}
                        sx={{ backgroundColor: 'transparent' }}
                        slotProps={{
                            legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                padding: 0,
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
} 