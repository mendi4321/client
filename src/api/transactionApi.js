// כתובת ה-API של העסקאות
import { BASE_URL } from './constance';
// 🔹 פונקציה לשליפת כל העסקאות
export async function getTransactions() {
    const response = await fetch(BASE_URL + 'transactions', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
    });//קבלת העסקאות מהשרת 
    const data = await response.json();
    return data;
}
//  פונקציה להוספת עסקה חדשה
export async function addTransaction(transaction) {
    try {
        const userData = JSON.parse(localStorage.getItem('user-data'));
        // בדיקת האם יש משתמש מחובר
        if (!userData || !userData.id) {
            throw new Error('נתוני המשתמש חסרים. אנא התחבר מחדש.');
        }
        // בדיקת קטגוריה רק אם זו הוצאה
        if (transaction.type === 'expense' && !transaction.category) {
            throw new Error('נא הוסף קטגוריה');
        }
        // יצירת עסקה עם מזהה משתמש
        const transactionWithUserId = {
            ...transaction,
            userId: userData.id
        };
        // שליחת העסקה לשרת 
        const response = await fetch(BASE_URL + 'transactions', {
            method: "POST",
            body: JSON.stringify(transactionWithUserId),
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('user-token')}`
            },
        });
        // בדיקת האם ההודעה נשלחה בהצלחה
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`שגיאת שרת: ${response.status} - ${errorText || response.statusText}`);
        }
        // קבלת הנתונים מהשרת
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}
//  פונקציה למחיקת עסקה לפי ID
export async function deleteTransaction(transactionId) {
    const response = await fetch(BASE_URL + 'transactions/' + transactionId, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
    });//מחיקת העסקה מהשרת
    const data = await response.json();
    return data;
}
//  פונקציה לעדכון עסקה
export async function updateTransaction(transactionId, transaction) {
    const response = await fetch(BASE_URL + 'transactions/' + transactionId, {
        method: "PUT",
        body: JSON.stringify(transaction),
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        },
    });//עדכון העסקה בשרת   
    const data = await response.json();
    return data;
}
