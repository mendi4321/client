import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import UpperBar from './components/UpperBar'
import { UserContextProvider } from './components/UserContext'
import IncomeExpenses from './components/IncomeExpenses'
import Income from './components/Income'
import Expenses from './components/Expenses'
import Home from './components/Home'
import Reminders from './components/Reminders'
import { useContext } from 'react';
import { UserContext } from './components/UserContext';

// קומפוננטת ProtectedRoute שתבדוק אם המשתמש מחובר
const ProtectedRoute = ({ children }) => {//מגן על הדף מכך שהמשתמש לא יכול להגיע לדף זה אם לא מחובר
  const { user } = useContext(UserContext);//מציאת המשתמש מהקונסטקט
  if (!user) {
    return <Navigate to="/" />;//אם המשתמש לא מחובר מעביר אותו לדף הבית
  }
  return children;//אם המשתמש מחובר מציג את הדף המוגן
};

// קומפוננטת האפליקציה  
function App() {
  return (
    <UserContextProvider>
      <Router>
        <UpperBar />
        <Routes>
          {/* נתיבים מוגנים - רק למשתמשים מחוברים */}
          <Route path="/income-expenses" element={
            <ProtectedRoute>
              <IncomeExpenses />
            </ProtectedRoute>
          } />
          <Route path="/income" element={
            <ProtectedRoute>
              <Income />
            </ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } />
          <Route path="/reminders" element={
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          } />
          <Route path="/tips" element={
            <ProtectedRoute>
              <div>Tips Page</div>
            </ProtectedRoute>
          } />

          {/* דף הבית - נגיש לכולם */}
          <Route path="/" element={<Home />} />

          {/* הפניה לדף הבית עבור נתיבים לא קיימים */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserContextProvider>
  )
}

export default App