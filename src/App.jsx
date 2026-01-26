import React from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/users/Home';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/dashboard" element={<Dashboard />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;