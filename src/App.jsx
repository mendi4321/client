import { useState } from 'react'
import './App.css'
import UpperBar from './components/UpperBar'
import { UserContextProvider } from './components/UserContext'
function App() {
  return (
    <UserContextProvider>
      <UpperBar />
    </UserContextProvider>
  )
}

export default App