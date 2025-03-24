// client/src/App.js
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const BACKEND_URL = "http://localhost:4000";

function App() {
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Establish Socket.IO connection
    const s = io(BACKEND_URL);
    setSocket(s);

    // Fetch the initial document content from the backend
    fetch(`${BACKEND_URL}/api/document`)
      .then((res) => res.json())
      .then((doc) => {
        setContent(doc.content);
      })
      .catch(console.error);

    // Listen for realtime document changes
    s.on("doc-change", (data) => {
      setContent(data);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Handle text changes and throttle emits
  const handleChange = (e) => {
    setContent(e.target.value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit("doc-change", e.target.value);
      }
    }, 300);
  };

  return (
    <div className="App">
      <h1>Real-Time Collaborative Editor</h1>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing..."
      />
    </div>
  );
}

export default App;
