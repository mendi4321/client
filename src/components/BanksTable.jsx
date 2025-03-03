import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

// תאי טבלה מעוצבים
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

// שורות טבלה מעוצבות
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const BanksTable = ({ banks }) => {
    // במקרה שאין נתונים, נשתמש במערך ריק
    const data = banks || [];

    return (
        <TableContainer component={Paper}>
            <Table aria-label="טבלת השוואת בנקים">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>שם הבנק</StyledTableCell>
                        <StyledTableCell>ריביות</StyledTableCell>
                        <StyledTableCell>עמלות</StyledTableCell>
                        <StyledTableCell>המלצות מותאמות אישית</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((bank, index) => (
                        <StyledTableRow key={index}>
                            <TableCell>{bank.name}</TableCell>
                            <TableCell>{bank.interestRates}</TableCell>
                            <TableCell>{bank.fees}</TableCell>
                            <TableCell>{bank.recommendations}</TableCell>
                        </StyledTableRow>
                    ))}
                    {data.length === 0 && (
                        <StyledTableRow>
                            <TableCell colSpan={4} align="center">
                                אין נתונים להצגה
                            </TableCell>
                        </StyledTableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BanksTable; 