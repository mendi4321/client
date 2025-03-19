import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { getAllUsers, deleteUser } from '../api/users';

export default function Admin() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null, userName: '' });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // בדיקה אם המשתמש הוא מנהל מערכת
    useEffect(() => {
        // אם אין משתמש מחובר או אם אין לו הרשאת מנהל, מעביר לדף הבית
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);
    // טעינת רשימת המשתמשים
    useEffect(() => {
        if (user && user.permission === 'admin') {
            loadUsers();
        }
    }, [user]);
    // פונקציה לטעינת רשימת המשתמשים
    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            setError(error.message || 'שגיאה בטעינת רשימת המשתמשים');
            setNotification({
                open: true,
                message: error.message || 'שגיאה בטעינת רשימת המשתמשים',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    // פונקציה לפתיחת חלון אישור מחיקה
    const handleDeleteClick = (userId, firstName, lastName) => {
        setConfirmDelete({
            open: true,
            userId,
            userName: `${firstName} ${lastName}`
        });
    };
    // פונקציה לאישור מחיקת משתמש
    const handleConfirmDelete = async () => {
        try {
            await deleteUser(confirmDelete.userId);
            // רענון רשימת המשתמשים
            loadUsers();
            setNotification({
                open: true,
                message: `המשתמש ${confirmDelete.userName} נמחק בהצלחה`,
                severity: 'success'
            });
        } catch (error) {
            setNotification({
                open: true,
                message: error.message || 'שגיאה במחיקת המשתמש',
                severity: 'error'
            });
        } finally {
            setConfirmDelete({ open: false, userId: null, userName: '' });
        }
    };
    // סגירת הודעת התראה
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };
    // אם אין משתמש מחובר או אין לו הרשאת מנהל, מציג הודעת שגיאה
    if (!user) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '70vh',
                    p: 3
                }}
            >
                <Typography variant="h5" color="error" gutterBottom>
                    טוען...
                </Typography>
            </Box>
        );
    }
    // בדיקה אם למשתמש יש הרשאת מנהל
    if (user.permission !== 'admin') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '70vh',
                    p: 3
                }}
            >
                <BlockIcon sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
                <Typography variant="h4" color="error" gutterBottom>
                    גישה נדחתה
                </Typography>
                <Typography variant="h6" color="#666" gutterBottom>
                    אין לך הרשאה לצפות בעמוד זה
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 3 }}
                >
                    חזרה לדף הבית
                </Button>
            </Box>
        );
    }
    // תוכן העמוד למשתמשים עם הרשאת מנהל
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3
            }}
        >
            <AdminPanelSettingsIcon sx={{ fontSize: 80, color: '#658285', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#658285' }}>
                אזור מנהל המערכת
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 3, color: '#666' }}>
                ברוך הבא: {user.firstName} {user.lastName}.
            </Typography>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: 800,
                    p: 3,
                    mt: 3,
                    backgroundColor: '#e9d0ab',
                    color: '#658285'
                }}
            >
                <Typography variant="h4" gutterBottom
                    sx={{
                        mb: 3,
                        borderBottom: '1px solid #658285',
                        pb: 1,
                        textAlign: 'center'
                    }}>
                    ניהול משתמשים
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress sx={{ color: '#658285' }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <TableContainer sx={{ maxHeight: 400, backgroundColor: 'white', borderRadius: 1 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#658285', color: '#e9d0ab', fontWeight: 'bold' }}>
                                        שם פרטי
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#658285', color: '#e9d0ab', fontWeight: 'bold' }}>
                                        שם משפחה
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#658285', color: '#e9d0ab', fontWeight: 'bold' }}>
                                        אימייל
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#658285', color: '#e9d0ab', fontWeight: 'bold' }}>
                                        הרשאה
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#658285', color: '#e9d0ab', fontWeight: 'bold' }}>
                                        פעולות
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((userItem) => (
                                    <TableRow
                                        key={userItem._id}
                                        sx={{
                                            '&:hover': { backgroundColor: '#f5f5f5' },
                                            backgroundColor: userItem._id === user.id ? '#f0f8ff' : '#fff9eb'
                                        }}
                                    >
                                        <TableCell>{userItem.firstName}</TableCell>
                                        <TableCell>{userItem.lastName}</TableCell>
                                        <TableCell>{userItem.email}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {userItem.permission === 'admin' ? (
                                                    <>
                                                        <VerifiedUserIcon sx={{ color: '#4caf50', mr: 1 }} />
                                                        מנהל
                                                    </>
                                                ) : (
                                                    <>
                                                        <PersonIcon sx={{ color: '#2196f3', mr: 1 }} />
                                                        רגיל
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {/* לא מאפשר למחוק את עצמך */}
                                            {userItem._id !== user.id && (
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteClick(userItem._id, userItem.firstName, userItem.lastName)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {users.length === 0 && !loading && !error && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        אין משתמשים במערכת
                    </Alert>
                )}
            </Paper>
            {/* חלון אישור מחיקה */}
            <Dialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, userId: null, userName: '' })}
                PaperProps={{
                    sx: {
                        backgroundColor: '#658285',
                    }
                }}
                keepMounted={false}
            >
                <DialogTitle sx={{ backgroundColor: '#658285', color: '#e9d0ab' }}>
                    אישור מחיקת משתמש
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#e9d0ab' }}>
                        האם אתה בטוח שברצונך למחוק את המשתמש {confirmDelete.userName}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDelete({ open: false, userId: null, userName: '' })}
                        sx={{ color: '#666' }}
                    >
                        ביטול
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                    >
                        מחק משתמש
                    </Button>
                </DialogActions>
            </Dialog>
            {/* התראות */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}