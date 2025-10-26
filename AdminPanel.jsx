import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() { try { const res = await axios.get('/api/auth/users'); setUsers(res.data); } catch (err) {} }
    if (user?.role === 'admin') load();
  }, [user]);

  const promote = async (id) => {
    await axios.post(`/api/auth/promote/${id}`);
    setUsers(users.map(u => u._id === id ? { ...u, role: 'admin' } : u));
  };

  if (user?.role !== 'admin') return <div className="p-6">Admin only</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Admin Panel — Users</h2>
      <ul>
        {users.map(u => (
          <li key={u._id} className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium">{u.name} <span className="text-sm text-gray-500">({u.email})</span></div>
              <div className="text-sm text-gray-400">Role: {u.role}</div>
            </div>
            {u.role !== 'admin' && (
              <button onClick={()=>promote(u._id)} className="px-3 py-1 rounded bg-blue-600 text-white">Promote</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
