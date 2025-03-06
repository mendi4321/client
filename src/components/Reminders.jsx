import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Stack,
    IconButton,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ButtonGroup,
    Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarAddIcon from '@mui/icons-material/Event';
import dayjs from 'dayjs';
import 'dayjs/locale/he'; // ייבוא לוקאל עברית
import { BASE_URL } from '../api/constance';

// מסך התזכורות של המשתמש   
export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [filteredReminders, setFilteredReminders] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [dateRange, setDateRange] = useState('month'); // אפשרויות: day, week, month, year
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        dueDate: dayjs()
    });

    // טעינת התזכורות בכל טעינת הדף
    useEffect(() => {
        fetchReminders();
    }, []);

    // סינון תזכורות לפי טווח זמן
    useEffect(() => {
        filterRemindersByDateRange();
    }, [reminders, dateRange]);

    // פונקציה לסינון תזכורות לפי טווח הזמן שנבחר
    const filterRemindersByDateRange = () => {
        const now = dayjs();
        let filtered;

        switch (dateRange) {
            case 'day':
                // סינון תזכורות מהיום
                filtered = reminders.filter(r =>
                    dayjs(r.dueDate).format('DD/MM/YYYY') === now.format('DD/MM/YYYY')
                );
                break;
            case 'week':
                // סינון תזכורות מהשבוע הקרוב
                const weekEnd = now.add(7, 'day');
                filtered = reminders.filter(r =>
                    dayjs(r.dueDate).isAfter(now.subtract(1, 'day')) &&
                    dayjs(r.dueDate).isBefore(weekEnd)
                );
                break;
            case 'month':
                // סינון תזכורות מהחודש הקרוב
                const monthEnd = now.add(30, 'day');
                filtered = reminders.filter(r =>
                    dayjs(r.dueDate).isAfter(now.subtract(1, 'day')) &&
                    dayjs(r.dueDate).isBefore(monthEnd)
                );
                break;
            case 'year':
                // סינון תזכורות מהשנה הקרובה
                const yearEnd = now.add(365, 'day');
                filtered = reminders.filter(r =>
                    dayjs(r.dueDate).isAfter(now.subtract(1, 'day')) &&
                    dayjs(r.dueDate).isBefore(yearEnd)
                );
                break;
            default:
                filtered = reminders;
        }

        setFilteredReminders(filtered);
    };

    // פונקציה שמחזירה את טווח הזמן שנבחר לתצוגה בעברית
    const dateRangeToDisplay = () => {
        switch (dateRange) {
            case 'day':
                return 'היום';
            case 'week':
                return 'שבוע קרוב';
            case 'month':
                return 'חודש קרוב';
            case 'year':
                return 'שנה קרובה';
            default:
                return '';
        }
    };

    // טעינת התזכורות מהשרת
    const fetchReminders = async () => {
        try {
            const response = await fetch(BASE_URL + 'reminders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('user-token')}`
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
                    'Authorization': `Bearer ${localStorage.getItem('user-token')}`
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
                    'Authorization': `Bearer ${localStorage.getItem('user-token')}`
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

    // פונקציה ליצירת קישור לגוגל קלנדר
    function createGoogleCalendarUrl(reminder) {
        const title = encodeURIComponent(reminder.title);
        const details = encodeURIComponent(`סכום: ₪${reminder.amount}`);
        const date = dayjs(reminder.dueDate).format('YYYYMMDD');

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${date}/${date}&ctz=Asia/Jerusalem`;
    }

    // מסך התזכורות
    return (
        <Container maxWidth="lg">
            <Box sx={{ pt: 4, pb: 6 }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, color: '#658285', fontWeight: 'bold', fontSize: '75px' }}>
                    תזכורות!
                </Typography>

                {/* רכיב בחירת טווח זמן - עיצוב חדש עם צ'יפים */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Stack direction="row" spacing={2}>
                        <Chip
                            icon={<TodayIcon />}
                            label="היום"
                            onClick={() => setDateRange('day')}
                            color={dateRange === 'day' ? 'primary' : 'default'}
                            sx={{
                                bgcolor: dateRange === 'day' ? '#658285' : 'transparent',
                                color: dateRange === 'day' ? 'white' : '#658285',
                                border: '1px solid #658285',
                                padding: '10px',
                                '&:hover': {
                                    bgcolor: dateRange === 'day' ? '#4a6366' : 'rgba(101, 130, 133, 0.1)'
                                }
                            }}
                        />
                        <Chip
                            icon={<DateRangeIcon />}
                            label="שבוע"
                            onClick={() => setDateRange('week')}
                            color={dateRange === 'week' ? 'primary' : 'default'}
                            sx={{
                                bgcolor: dateRange === 'week' ? '#658285' : 'transparent',
                                color: dateRange === 'week' ? 'white' : '#658285',
                                border: '1px solid #658285',
                                padding: '10px',
                                '&:hover': {
                                    bgcolor: dateRange === 'week' ? '#4a6366' : 'rgba(101, 130, 133, 0.1)'
                                }
                            }}
                        />
                        <Chip
                            icon={<EventIcon />}
                            label="חודש"
                            onClick={() => setDateRange('month')}
                            color={dateRange === 'month' ? 'primary' : 'default'}
                            sx={{
                                bgcolor: dateRange === 'month' ? '#658285' : 'transparent',
                                color: dateRange === 'month' ? 'white' : '#658285',
                                border: '1px solid #658285',
                                padding: '10px',
                                '&:hover': {
                                    bgcolor: dateRange === 'month' ? '#4a6366' : 'rgba(101, 130, 133, 0.1)'
                                }
                            }}
                        />
                        <Chip
                            icon={<CalendarMonthIcon />}
                            label="שנה"
                            onClick={() => setDateRange('year')}
                            color={dateRange === 'year' ? 'primary' : 'default'}
                            sx={{
                                bgcolor: dateRange === 'year' ? '#658285' : 'transparent',
                                color: dateRange === 'year' ? 'white' : '#658285',
                                border: '1px solid #658285',
                                padding: '10px',
                                '&:hover': {
                                    bgcolor: dateRange === 'year' ? '#4a6366' : 'rgba(101, 130, 133, 0.1)'
                                }
                            }}
                        />
                    </Stack>
                </Box>

                {/* כותרת עם טווח הזמן הנבחר - עדכון לשקיפות */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 4,
                        textAlign: 'center',
                        backgroundColor: 'transparent'
                    }}
                >
                    <Typography variant="h6" sx={{ color: '#658285' }}>
                        התזכורות שלך ({dateRangeToDisplay()})
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#658285', mt: 1, marginBottom: '0' }}>
                        סה"כ {filteredReminders.length} תזכורות
                    </Typography>
                </Paper>

                {/* כפתור ההוספה */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedReminder(null);
                            setFormData({
                                title: '',
                                amount: '',
                                dueDate: dayjs()
                            });
                            setOpenDialog(true);
                        }}
                        sx={{
                            backgroundColor: '#658285',
                            '&:hover': { backgroundColor: '#4a6366' }
                        }}
                    >
                        הוסף תזכורת
                    </Button>
                </Box>

                {/* טבלת התזכורות (מוצגות רק התזכורות שסוננו לפי טווח הזמן) */}
                <TableContainer
                    component={Paper}
                    sx={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        boxShadow: 3
                    }}
                >
                    <Table>
                        <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#658285', zIndex: 1 }}>
                            <TableRow >
                                <TableCell sx={{ color: '#e9d0ab', fontWeight: 'bold' }}>כותרת</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontWeight: 'bold' }}>סכום</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontWeight: 'bold' }}>תאריך</TableCell>
                                <TableCell sx={{ color: '#e9d0ab', fontWeight: 'bold' }}>פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ backgroundColor: '#e9d0ab' }}>
                            {filteredReminders.length > 0 ? (
                                filteredReminders.map((reminder) => (
                                    <TableRow key={reminder._id}>
                                        <TableCell>{reminder.title}</TableCell>
                                        <TableCell>₪{Number(reminder.amount).toLocaleString()}</TableCell>
                                        <TableCell>{new Date(reminder.dueDate).toLocaleDateString('he-IL')}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(reminder)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(reminder._id)}
                                                sx={{ mr: 1 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => window.open(createGoogleCalendarUrl(reminder), '_blank')}
                                            >
                                                <CalendarAddIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                                        אין תזכורות בטווח הזמן שנבחר
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* חלון להוספת תזכורת */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ backgroundColor: '#658285', color: '#e9d0ab' }}>
                        {selectedReminder ? 'עריכת תזכורת' : 'תזכורת חדשה'}
                    </DialogTitle>
                    {/* תוכן הדיאלוג */}
                    <DialogContent sx={{ backgroundColor: '#fff9eb' }}>
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
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
                                <DatePicker
                                    label="תאריך"
                                    value={formData.dueDate}
                                    onChange={(newDate) => setFormData({ ...formData, dueDate: newDate })}
                                    format="DD/MM/YYYY"
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Stack>
                    </DialogContent>
                    {/* כפתורים לסגירת הדיאלוג ולשמירת התזכורת */}
                    <DialogActions sx={{ backgroundColor: '#e9d0ab' }}>
                        <Button color='#658285' onClick={handleCloseDialog}>ביטול</Button>
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