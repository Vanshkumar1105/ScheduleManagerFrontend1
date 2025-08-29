const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Task Schema
const taskSchema = new mongoose.Schema({
  name: String,
  date: String,
  time: String,
  completed: { type: Boolean, default: false },
});
const Task = mongoose.model("Task", taskSchema);

// Correct path to frontend folder
const frontendPath = path.join(__dirname, "../frontend");

// Serve first page
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Serve task page
app.get("/tasks-page", (req, res) => {
  res.sendFile(path.join(frontendPath, "task.html"));
});

// Serve static files (CSS, JS)
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
