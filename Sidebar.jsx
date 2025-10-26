import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Sidebar({ onSelectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/auth/users');
        setUsers(res.data);
      } catch (err) {
        // ignore - only admin can fetch users
        const fallback = [{ _id: '1', name: 'Alice' }, { _id: '2', name: 'Bob' }];
        setUsers(fallback);
      }
    }
    load();
  }, []);

  return (
    <aside className="w-80 min-w-[280px] bg-white border-r">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-semibold">ChatApp</h1>
      </div>

      <div className="p-4">
        <input placeholder="Search" className="w-full p-2 rounded bg-gray-100 border" />
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
        {users.map(u => (
          <div key={u._id} onClick={() => onSelectUser && onSelectUser(u)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div className="flex-1">
              <div className="flex justify-between">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-400">now</div>
              </div>
              <div className="text-sm text-gray-500 truncate">Say hi!</div>
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
