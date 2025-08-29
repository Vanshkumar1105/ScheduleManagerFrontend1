const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/tasks");

// Task Schema
const taskSchema = new mongoose.Schema({
  name: String,
  date: String,
  time: String,
  completed: { type: Boolean, default: false },
});
const Task = mongoose.model("Task", taskSchema);

const frontendPath = path.join(__dirname, "../frontend");

// ✅ Serve login page for root
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/tasks-page", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ Serve all other frontend files (CSS, JS, index.html, etc.)
app.use(express.static(frontendPath));
// API endpoints
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const { name, date, time } = req.body;
  const task = new Task({ name, date, time });
  await task.save();
  res.json(task);
});

app.put("/tasks/:id/complete", async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

// Use environment variable PORT if available, else default to 5000
require('dotenv').config(); // Load .env variables


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});