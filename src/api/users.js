// שהפונקציה תהיה מסודרת ומובטחת
import { BASE_URL } from './constance';
// פונקציה להרשמת משתמש
export async function register(user) {
    // בדיקה אם יש שדה חסר במשתמש
    const response = await fetch(BASE_URL + 'user' + '/register', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    //שליפת המשתמש מהשרת
    const obj = await response.json();
    if (obj.success)
        return { data: obj.data, token: obj.token };
    throw new Error(obj.message);
}
// פונקציה להתחברות למערכת
export async function login(email, password) {
    const response = await fetch(BASE_URL + 'user' + '/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
    });
    //שליפת המשתמש מהשרת
    const obj = await response.json();
    if (obj.success)
        return { data: obj.data, token: obj.token };
    throw new Error(obj.message);
}

// פונקציה לקבלת רשימת כל המשתמשים - רק למנהלים
export async function getAllUsers() {
    const token = localStorage.getItem('user-token');
    if (!token) {
        throw new Error('נדרשת התחברות');
    }

    const response = await fetch(BASE_URL + 'user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const obj = await response.json();
    if (obj.success)
        return obj.data;
    throw new Error(obj.message);
}

// פונקציה למחיקת משתמש - רק למנהלים
export async function deleteUser(userId) {
    const token = localStorage.getItem('user-token');
    if (!token) {
        throw new Error('נדרשת התחברות');
    }

    const response = await fetch(BASE_URL + 'user' + `/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const obj = await response.json();
    if (obj.success)
        return true;
    throw new Error(obj.message);
}
