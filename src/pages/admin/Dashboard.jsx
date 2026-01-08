import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Plus, LogOut, Edit, X, Save, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stations, setStations] = useState([]);
  // ✅ 1. State එකට logoUrl එකතු කළා
  const [form, setForm] = useState({ name: '', category: '', language: 'Sinhala', streamUrl: '', logoUrl: '' });
  const [editingId, setEditingId] = useState(null);
  
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const token = localStorage.getItem('token');

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if(!token) navigate('/admin');
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/stations`);
      setStations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    // ✅ 2. Reset කරනකොට logoUrl එකත් හිස් කරනවා
    setForm({ name: '', category: '', language: 'Sinhala', streamUrl: '', logoUrl: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${backendUrl}/api/stations/${editingId}`, form, config);
        toast.success("Station Updated Successfully!");
      } else {
        await axios.post(`${backendUrl}/api/stations`, form, config);
        toast.success("Station Added Successfully!");
      }
      resetForm();
      fetchStations();
    } catch (err) {
      console.error(err);
      toast.error("Error processing request");
    }
  };

  const handleEditClick = (station) => {
    setEditingId(station._id);
    // ✅ 3. Edit කරනකොට පරණ ලෝගෝ එක ෆෝම් එකට ගන්නවා
    setForm({
      name: station.name,
      category: station.category,
      language: station.language || 'Sinhala',
      streamUrl: station.streamUrl,
      logoUrl: station.logoUrl || '' 
    });
  
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure you want to delete this station?")) {
        try {
            await axios.delete(`${backendUrl}/api/stations/${id}`, config);
            fetchStations();
        } catch (err) {
            toast.error("Error deleting station");
        }
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-900/50 p-2 rounded-lg hover:bg-red-900/20 transition">
                <LogOut size={18} /> Logout
            </button>
        </div>

        {/* --- ADD / EDIT FORM --- */}
        <div className={`p-6 rounded-xl border mb-8 transition-all duration-300 ${editingId ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-900 border-white/10'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {editingId ? <Edit size={20} className="text-purple-400"/> : <Plus size={20} className="text-green-400"/>} 
              {editingId ? "Edit Station" : "Add New Station"}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                <X size={16}/> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="md:col-span-2">
                <input 
                    type="text" placeholder="Station Name (e.g. Hiru FM)" required
                    value={form.name}
                    className="w-full bg-slate-800 p-3 rounded border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    onChange={e => setForm({...form, name: e.target.value})}
                />
            </div>

            {/* Category */}
            <input 
                type="text" placeholder="Category (e.g. News, Hits)" required
                value={form.category}
                className="bg-slate-800 p-3 rounded border border-white/10 focus:border-purple-500 focus:outline-none"
                onChange={e => setForm({...form, category: e.target.value})}
            />

            {/* Language Selection */}
            <select 
                value={form.language}
                onChange={e => setForm({...form, language: e.target.value})}
                className="bg-slate-800 p-3 rounded border border-white/10 focus:border-purple-500 focus:outline-none text-gray-300"
            >
                <option value="Sinhala">Sinhala</option>
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Multi">Multi Language</option>
            </select>

            {/* ✅ 4. Logo URL Input (New) */}
            <div className="md:col-span-2">
                <div className="flex gap-2">
                    <input 
                        type="text" placeholder="Logo Image URL (e.g. https://.../logo.png)" 
                        value={form.logoUrl}
                        className="w-full bg-slate-800 p-3 rounded border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-blue-300"
                        onChange={e => setForm({...form, logoUrl: e.target.value})}
                    />
                    {/* Small Preview inside form */}
                    {form.logoUrl && (
                        <div className="w-12 h-12 bg-black/50 rounded flex items-center justify-center border border-white/10 flex-shrink-0">
                            <img src={form.logoUrl} alt="Preview" className="w-full h-full object-cover rounded" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    )}
                </div>
            </div>

            {/* Stream URL */}
            <div className="md:col-span-2">
                <input 
                    type="text" placeholder="Stream URL (https://...)" required
                    value={form.streamUrl}
                    className="w-full bg-slate-800 p-3 rounded border border-white/10 focus:border-purple-500 focus:outline-none font-mono text-sm text-green-400"
                    onChange={e => setForm({...form, streamUrl: e.target.value})}
                />
            </div>

            {/* Submit Button */}
            <button className={`p-3 rounded font-bold transition md:col-span-2 flex justify-center items-center gap-2
                ${editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {editingId ? <Save size={18}/> : <Plus size={18}/>}
                {editingId ? "Update Station" : "Add Station"}
            </button>
          </form>
        </div>

        {/* --- STATION LIST --- */}
        <div className="space-y-3 pb-20">
          <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Available Stations ({stations.length})</h3>
          
          {stations.map(st => (
            <div key={st._id} className="bg-white/5 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center border border-white/5 hover:bg-white/10 transition group">
              <div className="mb-3 md:mb-0 flex items-center gap-4">
                
                {/* ✅ 5. List Logo Preview */}
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0">
                    {st.logoUrl ? (
                        <img src={st.logoUrl} alt={st.name} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-slate-600"/>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{st.name}</h3>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 uppercase">{st.language}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 uppercase">{st.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1 truncate max-w-xs md:max-w-md">{st.streamUrl}</p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto mt-3 md:mt-0">
                <button 
                  onClick={() => handleEditClick(st)}
                  className="flex-1 md:flex-none bg-blue-500/20 text-blue-500 p-2 rounded hover:bg-blue-500 hover:text-white transition border border-blue-500/20"
                >
                  <Edit size={18} />
                </button>

                <button 
                  onClick={() => handleDelete(st._id)}
                  className="flex-1 md:flex-none bg-red-500/20 text-red-500 p-2 rounded hover:bg-red-500 hover:text-white transition border border-red-500/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {stations.length === 0 && (
            <div className="text-center text-gray-500 py-10 bg-white/5 rounded-lg border border-dashed border-white/10">
                No stations found. Add one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;