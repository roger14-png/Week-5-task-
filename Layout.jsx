import React, { useContext, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { AuthContext } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';

export default function Layout(){
  const { user, token } = useContext(AuthContext);
  const { socket } = useSocket(token);
  const [activeUser, setActiveUser] = useState(null);

  return (
    <div className="h-screen flex">
      <Sidebar onSelectUser={setActiveUser} />
      <div className="flex-1 flex flex-col">
        <ChatWindow activeUserId={activeUser?._id} />
      </div>
    </div>
  );
}
