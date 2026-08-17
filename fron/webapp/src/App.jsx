import React from 'react'
import Login from './components/Login'
import { Route, Routes } from 'react-router-dom'
import Register from './components/Register'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import NewSale from './components/NewSale'
import Customers from './components/Customers'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sales/new" element={<NewSale />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers/>} />
    </Routes>
  )
}

export default App