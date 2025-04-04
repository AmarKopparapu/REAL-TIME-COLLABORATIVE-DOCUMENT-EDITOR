// backend/models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  documentId: { type: String, required: true },
  content: { type: String, default: "" }
});

module.exports = mongoose.model("Document", DocumentSchema);
