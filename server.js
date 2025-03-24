// backend/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIo = require("socket.io");

// Import the Document model
const Document = require("./models/Document");

const app = express();

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React dev server
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/collab-editor", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API endpoint to retrieve the shared document
app.get("/api/document", async (req, res) => {
  try {
    let document = await Document.findOne({ documentId: "default" });
    if (!document) {
      // Create a new document if one doesn't exist
      document = new Document({ documentId: "default", content: "" });
      await document.save();
    }
    res.json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Socket.IO for realtime updates
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for document changes from clients
  socket.on("doc-change", async (data) => {
    try {
      // Update the document in the database
      let document = await Document.findOne({ documentId: "default" });
      if (!document) {
        document = new Document({ documentId: "default", content: "" });
      }
      document.content = data;
      await document.save();

      // Broadcast the updated content to other clients
      socket.broadcast.emit("doc-change", data);
    } catch (err) {
      console.error("Error updating document:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the backend server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
