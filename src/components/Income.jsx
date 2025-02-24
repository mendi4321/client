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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTransactions } from "../api/transactionApi";
import AddTransactionDialog from './AddTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';

export default function Income() {
    const [transactions, setTransactions] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadTransactions();
    }, []);

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

    const totalIncome = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return (
        <Box sx={{ p: 3 }}>
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Paper sx={{ p: 2, mb: 4, bgcolor: '#e8f5e9', textAlign: 'center' }}>
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

            <AddTransactionDialog
                open={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                type="income"
                onSuccess={loadTransactions}
            />

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