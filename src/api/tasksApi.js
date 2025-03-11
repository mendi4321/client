// כתובת ה-API של המטלות
import { BASE_URL } from './constance';
//  פונקציה לשליפת כל המטלות
export async function getTasks(userId = null) {
    let url = BASE_URL + 'tasks';
    if (userId) {
        url += `?userId=${userId}`;
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
//  פונקציה להוספת מטלה חדשה
export async function addTasks(task) {
    try {
        const token = localStorage.getItem('user-token');
        if (!token) {
            throw new Error('אנא התחבר מחדש - לא נמצא טוקן');
        }

        const userData = JSON.parse(localStorage.getItem('user-data'));
        if (!userData || !userData.id) {
            throw new Error('נתוני המשתמש חסרים. אנא התחבר מחדש.');
        }

        const taskData = {
            title: task.title,
            description: task.description,
            Date: task.date
        };

        if (task.assignToUserId && userData.permission === 'admin') {
            taskData.assignToUserId = task.assignToUserId;
        }

        const response = await fetch(BASE_URL + 'tasks/', {
            method: "POST",
            body: JSON.stringify(taskData),
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`שגיאת שרת: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Error in addTasks:', error);
        throw error;
    }
}
//  פונקציה למחיקת מטלה לפי ID
export async function deleteTask(taskId) {
    const response = await fetch(`${BASE_URL}tasks/${taskId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
    });
    return { status: response.status, data: await response.json() };
}
//  פונקציה לעדכון מטלה
export async function updateTask(taskId, task) {
    const response = await fetch(`${BASE_URL}tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(task),
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
    });
    return { status: response.status, data: await response.json() };
}

// פונקציה חדשה לקבלת רשימת משתמשים (עבור אדמין)
export async function getUsers() {
    const response = await fetch(BASE_URL + 'users', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
    });
    const data = await response.json();
    return data;
}

