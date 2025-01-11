// src/pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Adjust URL for your server (e.g., http://localhost:5000)
const socket = io('http://localhost:5000');

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    // Clean up on unmount
    return () => {
      socket.off('chat_message');
    };
  }, []);

  const sendMessage = () => {
    if (newMsg.trim()) {
      socket.emit('chat_message', newMsg);
      setNewMsg('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Team Chat</h2>
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: '5px 0' }}>
            {msg}
          </div>
        ))}
      </div>
      <input
        style={{ width: '80%' }}
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        placeholder="Type message here..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatPage;