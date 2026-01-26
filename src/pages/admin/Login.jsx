import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.
      post(import.meta.env.VITE_BACKEND_URL + "/api/login", formData);
      localStorage.setItem('token', res.data.token);
      navigate('/login/dashboard');
    } catch (err) {
      setError('Invalid Username or Password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="Username"
            className="w-full bg-slate-800 text-white p-3 rounded-lg border border-white/5 focus:outline-none focus:border-purple-500"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-slate-800 text-white p-3 rounded-lg border border-white/5 focus:outline-none focus:border-purple-500"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button className="cursor-pointer w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;