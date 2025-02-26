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
    const userData = JSON.parse(localStorage.getItem('user-data'));

    const transactionWithUserId = {
        ...transaction,
        userId: userData.id,
        category: transaction.category  // וידוא שהקטגוריה נשלחת
    };

    const response = await fetch(BASE_URL + 'transactions', {
        method: "POST",
        body: JSON.stringify(transactionWithUserId),
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        },
    });

    if (!response.ok) {
        throw new Error('Failed to add transaction');
    }

    const data = await response.json();
    return data;
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
