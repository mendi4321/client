import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Stack,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { BASE_URL } from '../api/constance';

// מסך התזכורות של המשתמש   
export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        dueDate: dayjs()
    });
    // טעינת התזכורות בכל טעינת הדף
    useEffect(() => {
        fetchReminders();
    }, []);
    // טעינת התזכורות מהשרת
    const fetchReminders = async () => {
        try {
            const response = await fetch(BASE_URL + 'reminders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setReminders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('שגיאה בטעינת תזכורות:', error);
            setReminders([]);
        }
    };
    // פונקציה לשמירת התזכורת
    const handleSubmit = async () => {
        try {
            const method = selectedReminder ? 'PUT' : 'POST';
            const url = selectedReminder ? BASE_URL + 'reminders/' + selectedReminder._id : BASE_URL + 'reminders';

            // קבלת נתוני המשתמש מה-localStorage
            const userData = JSON.parse(localStorage.getItem('user-data'));

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    amount: Number(formData.amount),
                    dueDate: formData.dueDate.toISOString(),
                    userId: userData.id  // הוספת ה-userId לבקשה
                })
            });
            // בדיקה אם הבקשה נכשלה
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // סגירת הדילוג ושמירת התזכורת  
            handleCloseDialog();
            // טעינת התזכורות
            fetchReminders();
        } catch (error) {
            console.error('שגיאה בשמירת תזכורת:', error);
        }
    };
    // פונקציה למחיקת התזכורת
    const handleDelete = async (id) => {
        try {
            const response = await fetch(BASE_URL + 'reminders/' + id, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            fetchReminders();
        } catch (error) {
            console.error('שגיאה במחיקת תזכורת:', error);
        }
    };
    // פונקציה לעריכת התזכורת
    const handleEdit = (reminder) => {
        setSelectedReminder(reminder);
        setFormData({
            title: reminder.title,
            amount: reminder.amount,
            dueDate: dayjs(reminder.dueDate)
        });
        setOpenDialog(true);
    };
    // פונקציה לסגירת הדילוג
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedReminder(null);
        setFormData({
            title: '',
            amount: '',
            dueDate: dayjs()
        });
    };
    // מסך התזכורות
    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        תזכורות לתשלומים
                    </Typography>
                    {/* כפתור להוספת תזכורת */}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            backgroundColor: '#658285',
                            '&:hover': { backgroundColor: '#4a6366' }
                        }}
                    >
                        תזכורת חדשה
                    </Button>
                </Stack>
                {/* רשימת התזכורות */}
                <List>
                    {reminders.map((reminder) => (
                        <Paper
                            key={reminder._id}
                            elevation={2}
                            sx={{ mb: 2, borderRadius: 2 }}
                        >
                            {/* רשימת התזכורות */}
                            <ListItem
                                secondaryAction={
                                    <Stack direction="row" spacing={1}>
                                        {/* כפתור לעריכת התזכורת */}
                                        <IconButton onClick={() => handleEdit(reminder)}>
                                            <EditIcon />
                                        </IconButton>
                                        {/* כפתור למחיקת התזכורת */}
                                        <IconButton
                                            onClick={() => handleDelete(reminder._id)}
                                            sx={{ color: '#d32f2f' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                }
                            >
                                {/* רשימת התזכורות */}
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" component="div">
                                            {reminder.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography component="div" variant="body2" color="text.secondary">
                                            <Typography component="div" variant="body1" color="primary">
                                                ₪{reminder.amount}
                                            </Typography>
                                            <Typography component="div" variant="body2">
                                                תאריך: {new Date(reminder.dueDate).toLocaleDateString('he-IL')}
                                            </Typography>
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </Paper>
                    ))}
                </List>
                {/* דילוג להוספת תזכורת */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedReminder ? 'עריכת תזכורת' : 'תזכורת חדשה'}
                    </DialogTitle>
                    {/* תוכן הדילוג */}
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <TextField
                                label="כותרת"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="סכום"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                fullWidth
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="תאריך"
                                    value={formData.dueDate}
                                    onChange={(newDate) => setFormData({ ...formData, dueDate: newDate })}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Stack>
                    </DialogContent>
                    {/* כפתורים לסגירת הדילוג ולשמירת התזכורת */}
                    <DialogActions>
                        {/* כפתור לביטול */}
                        <Button onClick={handleCloseDialog}>ביטול</Button>
                        {/* כפתור לשמירת התזכורת */}
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            sx={{
                                backgroundColor: '#658285',
                                '&:hover': { backgroundColor: '#4a6366' }
                            }}
                        >
                            {selectedReminder ? 'עדכן' : 'צור'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
}