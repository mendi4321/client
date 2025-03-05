import React, { useEffect, useState } from "react";
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Paper, CircularProgress, Alert, MenuItem } from "@mui/material";
import { Delete, CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import { getTasks, addTasks, updateTask, deleteTask, getUsers } from '../api/tasksApi';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData] = useState(JSON.parse(localStorage.getItem('user-data')));
  const isAdmin = userData?.permission === 'admin';

  useEffect(() => {
    fetchTasks(); 
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      setTasks(response);
    } catch (error) {
      setError("Error fetching tasks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !taskDescription.trim() || !taskDate.trim()) {
      setError("כל השדות חייבים להיות מלאים");
      return;
    }
    try {
      const taskData = {
        title: newTask,
        description: taskDescription,
        date: taskDate,
      };

      const response = await addTasks(taskData);
      if (response.status === 201) {
        setTasks([...tasks, response.data]);
        setNewTask("");
        setTaskDescription("");
        setTaskDate("");
        setSelectedUser("");
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
    try {
      const response = await deleteTask(taskId);
      if (response.status === 200) {
        setTasks(tasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      setError("שגיאה במחיקת משימה: " + error.message);
    }
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "2rem" }}>
      <Paper elevation={3} style={{ padding: "1.5rem", borderRadius: "10px" }}>
        <Typography variant="h4" gutterBottom>
          לוח משימות
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <div style={{ marginBottom: "1rem" }}>
          <TextField
            fullWidth
            variant="outlined"
            label="הכנס משימה חדשה"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="תיאור משימה"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            style={{ marginTop: "0.5rem" }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="תחילת משימה"
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            style={{ marginTop: "0.5rem" }}
          />
            
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={addTask}
            style={{ marginTop: "0.5rem" }}
          >
            Add Task
          </Button>
        </div>
          {loading ? (
           <CircularProgress />
          ) : (
          <List>
            {tasks.map((task) => (
              <ListItem
                key={task._id}
                divider
                secondaryAction={
                  (
                    <IconButton edge="end" onClick={() => handleDelete(task._id)}>
                      <Delete color="error" />
                    </IconButton>
                  )
                }
              >
                <IconButton onClick={() => toggleTask(task._id)}>
                  {task.completed ? <CheckCircle color="success" /> : <RadioButtonUnchecked />}
                </IconButton>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <>
                      {task.description}- {task.date}
                      <br />
                      {task.assignedTo && ` ${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                    </>
                  }
                  style={{ textDecoration: task.completed ? "line-through" : "none" }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default TaskBoard;
