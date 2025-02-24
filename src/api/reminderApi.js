const BASE_URL = "http://localhost:3001/api/reminders";

// פונקציה שמחזירה את ההגדרות הבסיסיות לכל בקשה
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// קבלת כל התזכורות
export async function getReminders() {
    try {
        const response = await fetch(BASE_URL, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('שגיאה בקבלת תזכורות');
        }
        return await response.json();
    } catch (error) {
        console.error('שגיאה בקבלת תזכורות:', error);
        throw error;
    }
}

// יצירת תזכורת חדשה
export async function createReminder(reminderData) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(reminderData)
        });
        if (!response.ok) {
            throw new Error('שגיאה ביצירת תזכורת');
        }
        return await response.json();
    } catch (error) {
        console.error('שגיאה ביצירת תזכורת:', error);
        throw error;
    }
}

// עדכון תזכורת קיימת
export async function updateReminder(id, reminderData) {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(reminderData)
        });
        if (!response.ok) {
            throw new Error('שגיאה בעדכון תזכורת');
        }
        return await response.json();
    } catch (error) {
        console.error('שגיאה בעדכון תזכורת:', error);
        throw error;
    }
}

// מחיקת תזכורת
export async function deleteReminder(id) {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('שגיאה במחיקת תזכורת');
        }
        return await response.json();
    } catch (error) {
        console.error('שגיאה במחיקת תזכורת:', error);
        throw error;
    }
}

// קבלת תזכורות קרובות (לדף הבית)
export async function getUpcomingReminders(limit = 3) {
    try {
        const response = await fetch(`${BASE_URL}?limit=${limit}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('שגיאה בקבלת תזכורות קרובות');
        }
        return await response.json();
    } catch (error) {
        console.error('שגיאה בקבלת תזכורות קרובות:', error);
        throw error;
    }
}
