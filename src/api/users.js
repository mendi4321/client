// שהפונקציה תהיה מסודרת ומובטחת
const BASE_URL = 'http://localhost:3000/api/user';

// פונקציה להרשמת משתמש
export async function register(user) {
    // בדיקה אם יש שדה חסר במשתמש
    const response = await fetch(BASE_URL + '/register', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const obj = await response.json();
    if (obj.success)
        return obj.data;
    throw new Error(obj.message);
}
