// כתובת ה-API של העסקאות
const BASE_URL = "http://localhost:3001/api/transactions";

// 🔹 פונקציה לשליפת כל העסקאות
export async function getTransactions() {
    const response = await fetch(BASE_URL, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    return data;
}
// 🔹 פונקציה להוספת עסקה חדשה
export async function addTransaction(transaction) {
    // Get user data from localStorage and parse it
    const userData = JSON.parse(localStorage.getItem('user-data'));

    // Attach the user ID to the transaction
    const transactionWithUserId = {
        ...transaction,
        userId: userData.id
    };


    const response = await fetch(BASE_URL, {
        method: "POST",
        body: JSON.stringify(transactionWithUserId),
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const data = await response.json();
    return data;
}
// 🔹 פונקציה למחיקת עסקה לפי ID
export async function deleteTransaction(transactionId) {
    const response = await fetch(`${BASE_URL}/${transactionId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    return data;
}
// 🔹 פונקציה לעדכון עסקה
export async function updateTransaction(transactionId, transaction) {
    const response = await fetch(`${BASE_URL}/${transactionId}`, {
        method: "PUT",
        body: JSON.stringify(transaction),
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const data = await response.json();
    return data;
}
