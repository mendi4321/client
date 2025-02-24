// שהפונקציה תהיה מסודרת ומובטחת
const BASE_URL = 'http://localhost:3001/api/user';//

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
        return { data: obj.data, token: obj.token };
    throw new Error(obj.message);
}
// פונקציה להתחברות למערכת
export async function login(email, password) {
    const response = await fetch(BASE_URL + '/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
    });
    const obj = await response.json();
    if (obj.success)
        return { data: obj.data, token: obj.token };
    throw new Error(obj.message);
}
