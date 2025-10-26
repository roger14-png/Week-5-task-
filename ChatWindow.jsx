import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import axios from 'axios';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ activeUserId }) {
  const { token, user } = useContext(AuthContext);
  const { socket } = useSocket(token);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef();

  useEffect(() => {
    if (!socket) return;
    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    socket.on('typing', (t) => {
      // handle typing
    });
    return () => {
      socket?.off('newMessage');
      socket?.off('typing');
    };
  }, [socket]);

  useEffect(() => {
    async function loadHistory() {
      try {
        if (activeUserId) {
          const res = await axios.get(`/api/messages?user=${activeUserId}`);
          setMessages(res.data);
        } else {
          setMessages([]);
        }
      } catch (err) {
        // ignore - optional
      }
    }
    loadHistory();
  }, [activeUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    if (socket) {
      const payload = activeUserId ? { to: activeUserId, text } : { text };
      socket.emit('sendMessage', payload);
      setText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="p-4 border-b flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-300" />
        <div className="flex-1">
          <div className="font-semibold">{activeUserId ? 'Chat' : 'Select a user'}</div>
          <div className="text-sm text-gray-500">online</div>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto bg-[url('/chat-bg.svg')]">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(m => <MessageBubble key={m._id || m.createdAt} text={m.text} fromMe={m.from === user?.id || m.from === user?._id} />)}
          <div ref={endRef} />
        </div>
      </div>

      <footer className="p-4 border-t">
        <div className="flex gap-3">
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=> e.key==='Enter' && sendMessage()} className="flex-1 p-3 rounded-full border bg-white" placeholder="Message" />
          <button onClick={sendMessage} className="px-4 py-2 rounded-full bg-sky-600 text-white">Send</button>
        </div>
      </footer>
    </div>
  );
}
