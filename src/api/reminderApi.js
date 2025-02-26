import { BASE_URL } from './constance';//קביעת הבסיס של השרת    

// פונקציה שמחזירה את ההגדרות הבסיסיות לכל בקשה
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('user-token')}`
});

// קבלת כל התזכורות
export async function getReminders() {
    try {
        const response = await fetch(BASE_URL + 'reminders', {
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching reminders:', error);
        throw error;
    }
}

// יצירת תזכורת חדשה
export async function createReminder(reminderData) {
    try {
        const response = await fetch(BASE_URL + 'reminders', {
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
        const response = await fetch(BASE_URL + 'reminders/' + id, {
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
        const response = await fetch(BASE_URL + 'reminders/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('user-token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting reminder:', error);
        throw error;
    }
}

// קבלת תזכורות קרובות (לדף הבית)
export async function getUpcomingReminders(limit = 3) {
    try {
        const response = await fetch(BASE_URL + 'reminders?limit=' + limit, {
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
