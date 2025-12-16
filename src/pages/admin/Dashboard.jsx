import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', streamUrl: '' });
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Token එක ගන්න
  const token = localStorage.getItem('token');

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if(!token) navigate('/admin');
    fetchStations();
  }, []);

  const fetchStations = async () => {
    const res = await axios.get(`${backendUrl}/api/stations`);
    setStations(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/api/stations`, form, config);
      setForm({ name: '', category: '', streamUrl: '' });
      fetchStations();
      alert("Station Added!");
    } catch (err) {
      alert("Error adding station");
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure?")) {
        try {
            await axios.delete(`${backendUrl}/api/stations/${id}`, config);
            fetchStations();
        } catch (err) {
            alert("Error deleting station");
        }
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                <LogOut size={18} /> Logout
            </button>
        </div>

        {/* Add Form */}
        <div className="bg-slate-900 p-6 rounded-xl border border-white/10 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Add New Station</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
                type="text" placeholder="Station Name" required
                value={form.name}
                className="bg-slate-800 p-3 rounded border border-white/5"
                onChange={e => setForm({...form, name: e.target.value})}
            />
            <input 
                type="text" placeholder="Category (Ex: News)" required
                value={form.category}
                className="bg-slate-800 p-3 rounded border border-white/5"
                onChange={e => setForm({...form, category: e.target.value})}
            />
            <input 
                type="text" placeholder="Stream URL" required
                value={form.streamUrl}
                className="bg-slate-800 p-3 rounded border border-white/5"
                onChange={e => setForm({...form, streamUrl: e.target.value})}
            />
            <button className="bg-purple-600 p-3 rounded font-bold hover:bg-purple-700 md:col-span-3">Add Station</button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-3">
          {stations.map(st => (
            <div key={st._id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center border border-white/5">
              <div>
                <h3 className="font-bold">{st.name}</h3>
                <p className="text-sm text-slate-400">{st.streamUrl}</p>
              </div>
              <button 
                onClick={() => handleDelete(st._id)}
                className="bg-red-500/20 text-red-500 p-2 rounded hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;