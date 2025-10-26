import React from 'react';

export default function MessageBubble({ text, fromMe }) {
  return (
    <div className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`${fromMe ? 'bg-[#DCF8C6] self-end text-black' : 'bg-white text-black'} p-3 rounded-xl shadow max-w-[80%]`}>
        <div className="whitespace-pre-wrap">{text}</div>
        <div className="text-xs text-gray-400 mt-2 text-right">11:45</div>
      </div>
    </div>
  );
}
