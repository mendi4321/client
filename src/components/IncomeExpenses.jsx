import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function IncomeExpenses() {
    // ניהול מצב החלוניות
    const [openIncomeDialog, setOpenIncomeDialog] = useState(false);
    const [openExpenseDialog, setOpenExpenseDialog] = useState(false);

    // מערכים לשמירת הנתונים
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // נתונים לדוגמה בטבלה
    const sampleData = [
        { date: '2024-03-20', description: 'משכורת', amount: '10000' },
        { date: '2024-03-21', description: 'בונוס', amount: '2000' },
    ];

    return (
        <Box sx={{ p: 2 }}>
            {/* קופסאות עליונות */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                {/* קופסת הכנסות */}
                <Box sx={{ textAlign: 'center' }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            backgroundColor: '#e8f5e9',
                            width: 200,
                            height: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="h6">הכנסות</Typography>
                        <Typography variant="h4">₪{incomes.reduce((sum, income) => sum + Number(income.amount), 0)}</Typography>
                    </Paper>
                    <IconButton
                        onClick={() => setOpenIncomeDialog(true)}
                        sx={{
                            mt: 2,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            '&:hover': { backgroundColor: '#388e3c' }
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Box>

                {/* קופסת הוצאות */}
                <Box sx={{ textAlign: 'center' }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            backgroundColor: '#ffebee',
                            width: 200,
                            height: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="h6">הוצאות</Typography>
                        <Typography variant="h4">₪{expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)}</Typography>
                    </Paper>
                    <IconButton
                        onClick={() => setOpenExpenseDialog(true)}
                        sx={{
                            mt: 2,
                            backgroundColor: '#f44336',
                            color: 'white',
                            '&:hover': { backgroundColor: '#d32f2f' }
                        }}
                    >
                        <RemoveIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* חלונית הכנסות */}
            <Dialog open={openIncomeDialog} onClose={() => setOpenIncomeDialog(false)}>
                <DialogTitle>הכנסות</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>תאריך</TableCell>
                                    <TableCell>תיאור</TableCell>
                                    <TableCell>סכום</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sampleData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>

            {/* חלונית הוצאות */}
            <Dialog open={openExpenseDialog} onClose={() => setOpenExpenseDialog(false)}>
                <DialogTitle>הוצאות</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>תאריך</TableCell>
                                    <TableCell>תיאור</TableCell>
                                    <TableCell>סכום</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sampleData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>

            {/* הצגת הרשומות האחרונות */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>רשומות אחרונות</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>תאריך</TableCell>
                                <TableCell>תיאור</TableCell>
                                <TableCell>סכום</TableCell>
                                <TableCell>סוג</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...incomes, ...expenses]
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 5)
                                .map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                        <TableCell>{row.type === 'income' ? 'הכנסה' : 'הוצאה'}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default IncomeExpenses; 