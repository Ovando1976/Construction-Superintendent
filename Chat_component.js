import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    // Connect to the server
    socketRef.current = io.connect('http://localhost:5000');

    // Listen for incoming messages
    socketRef.current.on('message', (message) => {
      setMessages((messages) => [...messages, message]);
    });

    // Clean up the socket connection on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Send the user's message to the server
    socketRef.current.emit('message', userInput);

    // Clear the input field
    setUserInput('');
  };

  const handleChange = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((message, index) => (
          <div className="message" key={index}>
            <p>{message}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={handleChange}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
