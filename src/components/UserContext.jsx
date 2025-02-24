import { createContext, useState, useEffect } from "react";

// מספר המשתמש המחובר
export const UserContext = createContext();

// מספר המשתמש המחובר
export function UserContextProvider(props) {
    const [user, setUser] = useState(null);// משתנה שמכיל את המשתמש המחובר
    const logUser = (userData, token) => {// פונקציה שמכילה את המשתמש המחובר ואת הטוקן
        localStorage.setItem('user-data', JSON.stringify(userData));
        localStorage.setItem('user-token', token);
        setUser(userData);
    }// מחיקת משתמש מחובר
    const unlogUser = () => {
        localStorage.removeItem('user-data');
        localStorage.removeItem('user-token');
        setUser(null);
    }
    // טעינת המשתמש המחובר  
    useEffect(() => {
        const token = localStorage.getItem('user-token');
        const userData = localStorage.getItem('user-data');
        if (token && !userData) {
            localStorage.removeItem('user-token');
        } else if (!token && userData) {
            localStorage.removeItem('user-data');
        } else if (token && userData) {
            setUser(JSON.parse(userData));
        }
    }, []);
    // מחזיר את המשתמש המחובר ואת הפונקציות הקשורות לו
    const value = { user, logUser, unlogUser };
    // מחזיר את המשתמש המחובר ואת הפונקציות הקשורות לו
    return <UserContext.Provider value={value}>
        {props.children}
    </UserContext.Provider>
}


