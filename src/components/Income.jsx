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
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTransactions, deleteTransaction } from '../api/transactionApi';
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';

// מסך ההכנסות
export default function Income() {
    const [transactions, setTransactions] = useState([]);
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
    // טעינת ההכנסות
    useEffect(() => {
        loadTransactions();
    }, []);
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
    // סינון רק של ההכנסות
    const totalIncome = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
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
    // מסך ההכנסות
    return (
        <Box sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
        }}>
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            {/* כותרת ההכנסות */}
            <Paper sx={{
                p: 2, mb: 4,
                bgcolor: '#e8f5e9',
                textAlign: 'center',
                borderRadius: '10px',
                width: '50%',
            }}>
                <Typography variant="h6">סך כל ההכנסות</Typography>
                <Typography variant="h4" sx={{ my: 2 }}>
                    ₪{totalIncome.toLocaleString()}
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
            {/* טבלת ההכנסות */}
            <TableContainer component={Paper}
                sx={{
                    backgroundColor: '#658285',
                    height: '50vh',
                    width: '80%',
                }}>
                <Table >
                    <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#658285', zIndex: 1 }}>
                        <TableRow >
                            <TableCell sx={{ color: '#e9d0ab' }}>תאריך</TableCell>
                            <TableCell sx={{ color: '#e9d0ab' }}>תיאור</TableCell>
                            <TableCell sx={{ color: '#e9d0ab' }}>סכום</TableCell>
                            <TableCell sx={{ color: '#e9d0ab' }}>פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ backgroundColor: '#e9d0ab' }}>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>₪{Number(transaction.amount).toLocaleString()}</TableCell>
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
                                        disabled={!transaction._id}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
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
            >
                <DialogTitle>אישור מחיקה</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        האם אתה בטוח שברצונך למחוק הכנסה זו?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, transactionId: null })}>
                        ביטול
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        מחק
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 