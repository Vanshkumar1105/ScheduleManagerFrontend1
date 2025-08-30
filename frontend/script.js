document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");
  const taskList = document.getElementById("taskList");

  // ✅ Use your Render backend URL
  const API_BASE = "https://schedulemanagerbackend-49kg.onrender.com";

  // Initialize FullCalendar
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: 500,
    events: [],
  });
  calendar.render();

  // Load tasks from backend
  async function loadTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const tasks = await res.json();
      taskList.innerHTML = "";
      tasks.forEach((task) => {
        addTaskToDOM(task);
        addTaskToCalendar(task);
      });
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  }

  loadTasks();

  // Add new task
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: taskText,
          date: dateInput.value,
          time: timeInput.value,
        }),
      });

      const newTask = await res.json();
      addTaskToDOM(newTask);
      addTaskToCalendar(newTask);

      taskInput.value = "";
      dateInput.value = "";
      timeInput.value = "";
    } catch (err) {
      console.error("Error adding task:", err);
    }
  });

  // Complete and Delete task
  taskList.addEventListener("click", async (e) => {
    const taskId = e.target.dataset.id;
    if (!taskId) return;

    // Complete task
    if (e.target.classList.contains("complete-btn")) {
      try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, { method: "PUT" });
        const updatedTask = await res.json();

        const li = e.target.parentElement;
        li.classList.toggle("completed", updatedTask.completed);

        const event = calendar.getEventById(taskId);
        if (event) event.setProp("color", updatedTask.completed ? "gray" : "#e0e3e9ff");
      } catch (err) {
        console.error("Error completing task:", err);
      }
    }

    // Delete task
    if (e.target.classList.contains("delete-btn")) {
      try {
        await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
        e.target.parentElement.remove();

        const event = calendar.getEventById(taskId);
        if (event) event.remove();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  });

  // Add task to DOM
  function addTaskToDOM(task) {
    const li = document.createElement("li");
    li.textContent = `${task.name} - ${task.date}${task.time ? " " + task.time : ""}`;
    li.className = task.completed ? "completed" : "";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.className = "complete-btn";
    completeBtn.dataset.id = task._id.toString();

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.className = "delete-btn";
    deleteBtn.dataset.id = task._id;

    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  }

  // Add task to calendar
  function addTaskToCalendar(task) {
    if (!task.date) return;
    let start = task.date;
    if (task.time) start += "T" + task.time;

    calendar.addEvent({
      id: task._id.toString(),
      title: task.name,
      start,
      color: task.completed ? "gray" : "#66a6ff",
    });
  }
});
