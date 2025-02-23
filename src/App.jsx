import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import UpperBar from './components/UpperBar'
import { UserContextProvider } from './components/UserContext'
import IncomeExpenses from './components/IncomeExpenses'
import Home from './components/Home'


function App() {
  return (
    <UserContextProvider>
      <Router>
        <UpperBar />
        <Routes>
          <Route path="/income-expenses" element={<IncomeExpenses />} />
          <Route path="/tips" element={<div>Tips Page</div>} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </UserContextProvider>
  )
}

export default App