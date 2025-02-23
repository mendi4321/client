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
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTransactions, deleteTransaction } from "../api/transactionApi";
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';

export default function IncomeExpenses() {
    const [transactions, setTransactions] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [error, setError] = useState('');
    const [editTransaction, setEditTransaction] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        transactionId: null
    });

    // טעינת העסקאות בטעינת הדף
    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data);
        } catch (err) {
            setError('שגיאה בטעינת הנתונים');
            console.error(err);
        }
    };

    const handleAddClick = (type) => {
        setTransactionType(type);
        setShowAddDialog(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({
            open: true,
            transactionId: id
        });
    };

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
            console.error(err);
        } finally {
            setDeleteDialog({ open: false, transactionId: null });
        }
    };

    const handleEdit = (transaction) => {
        setEditTransaction(transaction);
    };

    // חישוב סכומים
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ p: 3 }}>
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
                {/* תיבת הכנסות */}
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                    <Typography variant="h6">הכנסות</Typography>
                    <Typography variant="h4" sx={{ my: 2 }}>
                        ₪{totalIncome.toLocaleString()}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddClick('income')}
                        sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                    >
                        הוסף הכנסה
                    </Button>
                </Paper>

                {/* תיבת הוצאות */}
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#ffebee', textAlign: 'center' }}>
                    <Typography variant="h6">הוצאות</Typography>
                    <Typography variant="h4" sx={{ my: 2 }}>
                        ₪{totalExpenses.toLocaleString()}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<RemoveIcon />}
                        onClick={() => handleAddClick('expense')}
                        sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                    >
                        הוסף הוצאה
                    </Button>
                </Paper>
            </Stack>

            {/* טבלת עסקאות */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>תאריך</TableCell>
                            <TableCell>תיאור</TableCell>
                            <TableCell>סכום</TableCell>
                            <TableCell>סוג</TableCell>
                            <TableCell>פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>₪{Number(transaction.amount).toLocaleString()}</TableCell>
                                <TableCell>{transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEdit(transaction)}
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
                <DialogTitle>
                    אישור מחיקה
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        האם אתה בטוח שברצונך למחוק עסקה זו?
                    </DialogContentText>
                </DialogContent>
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
}
