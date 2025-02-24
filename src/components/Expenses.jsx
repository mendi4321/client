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
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTransactions } from "../api/transactionApi";
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';

// מסך ההוצאות  
export default function Expenses() {
    const [transactions, setTransactions] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const [error, setError] = useState('');

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

    // מסך ההוצאות
    return (
        <Box sx={{ p: 3 }}>
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            {/* כותרת ההוצאות */}
            <Paper sx={{ p: 2, mb: 4, bgcolor: '#ffebee', textAlign: 'center' }}>
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>תאריך</TableCell>
                            <TableCell>תיאור</TableCell>
                            <TableCell>סכום</TableCell>
                            <TableCell>פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
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
        </Box>
    );
} 