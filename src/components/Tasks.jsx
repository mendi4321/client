import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Fade,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Delete, CheckCircle, RadioButtonUnchecked, AddTask, Event, Description, Person } from "@mui/icons-material";
import { getTasks, addTasks, updateTask, deleteTask } from '../api/tasksApi';
import dayjs from 'dayjs';
import 'dayjs/locale/he';

// צבעי האתר המקוריים
const COLORS = {
  primary: '#658285',
  secondary: '#e9d0ab',
  text: '#333333',
  background: '#f5f5f5',
  white: '#ffffff',
  success: '#4caf50',
  error: '#f44336'
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData] = useState(JSON.parse(localStorage.getItem('user-data')));
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // כל משתמש רואה רק את המשימות שלו
      const response = await getTasks(userData?.id);
      setTasks(response);
    } catch (error) {
      setError("Error fetching tasks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !taskDescription.trim() || !taskDate) {
      setError("כל השדות חייבים להיות מלאים");
      return;
    }
    try {
      const taskData = {
        title: newTask,
        description: taskDescription,
        date: taskDate.format('YYYY-MM-DD'),
      };

      const response = await addTasks(taskData);
      if (response.status === 201) {
        // רענון הרשימה אחרי הוספת משימה
        await fetchTasks();
        setNewTask("");
        setTaskDescription("");
        setTaskDate(dayjs());
        setError("");
      }
    } catch (error) {
      setError("שגיאה בהוספת משימה: " + error.message);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(task => task._id === taskId);
      const response = await updateTask(taskId, { completed: !task.completed });
      if (response.status === 200) {
        setTasks(tasks.map(task => task._id === taskId ? { ...task, completed: !task.completed } : task));
      } else {
        setError("תגובה לא צפויה: " + response.status);
      }
    } catch (error) {
      setError("שגיאה בעדכון משימה: " + error.message);
    }
  };

  const handleDelete = async (taskId) => {
    const taskToRemove = tasks.find(task => task._id === taskId);
    setTaskToDelete(taskToRemove);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteTask(taskToDelete._id);
      if (response.status === 200) {
        setTasks(tasks.filter(task => task._id !== taskToDelete._id));
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      }
    } catch (error) {
      setError("שגיאה במחיקת משימה: " + error.message);
      setDeleteDialogOpen(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in={true} timeout={800}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            bgcolor: COLORS.white,
            backgroundColor: '#e9d0ab'
          }}
        >
          {/* כותרת */}
          <Box
            sx={{
              p: 2.5,
              textAlign: "center",
              bgcolor: COLORS.primary,
              borderBottom: `4px solid ${COLORS.secondary}`
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: COLORS.white,
                fontWeight: 600,
                color: '#e9d0ab'
              }}
            >
              ניהול משימות
            </Typography>
          </Box>

          {/* תוכן */}
          <Box sx={{ p: 3 }}>
            {/* הודעת שגיאה */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: "8px",
                  "& .MuiAlert-icon": { color: COLORS.error }
                }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {/* חלק ראשון: לוח משימות */}
            <Box
              sx={{
                bgcolor: COLORS.white,
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                mb: 4,
                p: 3,
                backgroundColor: '#fff9eb'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  color: COLORS.primary,
                  fontWeight: 600,
                  textAlign: 'center',
                  borderBottom: `2px solid ${COLORS.primary}`,
                  paddingBottom: '10px'
                }}
              >
                הוספת משימה חדשה
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="כותרת המשימה"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    InputLabelProps={{ sx: { color: COLORS.primary } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.primary
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.primary
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="תיאור המשימה"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    multiline
                    rows={2}
                    InputLabelProps={{ sx: { color: COLORS.primary } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.primary
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.primary
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
                    <DatePicker
                      label="תאריך ביצוע"
                      value={taskDate}
                      onChange={(newDate) => setTaskDate(newDate)}
                      format="DD/MM/YYYY"
                      sx={{
                        width: '100%',
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.primary
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.primary
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    disableElevation
                    onClick={addTask}
                    sx={{
                      py: 1.2,
                      mt: 1,
                      bgcolor: COLORS.primary,
                      color: '#e9d0ab',
                      fontWeight: 600,
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: '#526668'
                      }
                    }}
                    startIcon={<AddTask />}
                  >
                    הוסף משימה
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* חלק שני: רשימת המשימות */}
            <Box
              sx={{
                bgcolor: COLORS.white,
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                p: 3,
                backgroundColor: '#fff9eb'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  color: COLORS.primary,
                  fontWeight: 600,
                  textAlign: 'center',
                  borderBottom: `2px solid ${COLORS.primary}`,
                  paddingBottom: '10px'
                }}
              >
                המשימות שלי
              </Typography>

              {/* כותרת וסיכום */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: `1px solid ${COLORS.primary}`,
                }}
              >
                <Chip
                  label={`סה"כ: ${tasks.length}`}
                  size="small"
                  sx={{
                    bgcolor: COLORS.secondary,
                    color: COLORS.primary,
                    fontWeight: 600,
                    ml: 'auto'
                  }}
                />
              </Box>

              {/* טבלת המשימות עם גלילה */}
              <Box
                sx={{
                  height: '300px',
                  overflow: 'auto',
                  borderRadius: '8px',
                  border: `1px solid ${COLORS.primary}`,
                  bgcolor: 'rgba(101, 130, 133, 0.05)',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(101, 130, 133, 0.05)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: COLORS.primary,
                    borderRadius: '4px',
                  },
                }}
              >
                {/* תצוגת טעינה */}
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: COLORS.primary }} />
                  </Box>
                ) : tasks.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      px: 2
                    }}
                  >
                    <Typography variant="body1" sx={{ color: COLORS.primary, mb: 1 }}>
                      אין משימות להצגה כרגע
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      הוסף משימה חדשה כדי להתחיל
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 1 }}>
                    {tasks.map((task, index) => (
                      <Card
                        key={task._id}
                        variant="outlined"
                        sx={{
                          mb: 2,
                          borderRadius: "10px",
                          borderColor: task.completed ? 'rgba(76, 175, 80, 0.3)' : COLORS.primary,
                          bgcolor: task.completed ? 'rgba(76, 175, 80, 0.04)' : 'rgba(101, 130, 133, 0.04)',
                          transition: 'all 0.3s',
                          "&:hover": {
                            borderColor: task.completed ? 'rgba(76, 175, 80, 0.6)' : COLORS.secondary,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        <ListItem
                          sx={{
                            p: 2,
                            borderRight: task.completed
                              ? '4px solid rgba(76, 175, 80, 0.7)'
                              : `4px solid ${COLORS.secondary}`
                          }}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete(task._id)}
                              sx={{
                                color: COLORS.error,
                                opacity: 0.7,
                                "&:hover": {
                                  opacity: 1,
                                  bgcolor: 'rgba(244, 67, 54, 0.08)'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          }
                        >
                          <IconButton
                            onClick={() => toggleTask(task._id)}
                            sx={{
                              mr: 1.5,
                              color: task.completed ? COLORS.success : COLORS.primary,
                              bgcolor: task.completed ? 'rgba(76, 175, 80, 0.08)' : 'rgba(101, 130, 133, 0.08)',
                              "&:hover": {
                                bgcolor: task.completed ? 'rgba(76, 175, 80, 0.15)' : 'rgba(101, 130, 133, 0.15)'
                              }
                            }}
                          >
                            {task.completed ? <CheckCircle /> : <RadioButtonUnchecked />}
                          </IconButton>

                          <ListItemText
                            disableTypography
                            primary={
                              <Typography
                                variant="h6"
                                sx={{
                                  fontSize: "1rem",
                                  fontWeight: 600,
                                  color: task.completed ? COLORS.success : COLORS.primary,
                                  mb: 0.5,
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  opacity: task.completed ? 0.8 : 1
                                }}
                              >
                                {task.title}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ fontSize: "0.875rem", color: COLORS.text }}>
                                <Box
                                  component="div"
                                  sx={{
                                    mb: 1,
                                    color: 'text.secondary',
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    opacity: task.completed ? 0.7 : 1
                                  }}
                                >
                                  {task.description}
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  <Chip
                                    icon={<Event style={{ fontSize: '0.9rem' }} />}
                                    label={task.date}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(101, 130, 133, 0.08)',
                                      borderRadius: '4px',
                                      height: '24px'
                                    }}
                                  />

                                  {task.assignedTo && (
                                    <Chip
                                      icon={<Person style={{ fontSize: '0.9rem' }} />}
                                      label={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                                      size="small"
                                      sx={{
                                        bgcolor: 'rgba(233, 208, 171, 0.2)',
                                        color: COLORS.primary,
                                        borderRadius: '4px',
                                        height: '24px'
                                      }}
                                    />
                                  )}

                                  {task.completed && (
                                    <Chip
                                      label="הושלם"
                                      size="small"
                                      sx={{
                                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                                        color: COLORS.success,
                                        borderRadius: '4px',
                                        height: '24px',
                                        fontWeight: 500
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      </Card>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* חלון אישור מחיקה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{
          bgcolor: COLORS.primary,
          color: COLORS.secondary,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {"אישור מחיקת משימה"}
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 4, mt: 1 }}>
          <DialogContentText id="alert-dialog-description" sx={{ color: COLORS.primary, textAlign: 'center' }}>
            האם אתה בטוח שברצונך למחוק את המשימה
            <Box component="span" sx={{ fontWeight: 'bold', color: COLORS.primary, mx: 1 }}>
              "{taskToDelete?.title}"?
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={cancelDelete}
            sx={{
              color: COLORS.primary,
              bgcolor: 'rgba(101, 130, 133, 0.08)',
              px: 3,
              '&:hover': {
                bgcolor: 'rgba(101, 130, 133, 0.15)'
              }
            }}
          >
            ביטול
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            autoFocus
            sx={{ px: 3 }}
          >
            מחק משימה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskBoard;

