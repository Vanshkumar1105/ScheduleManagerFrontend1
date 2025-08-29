document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");
  const taskList = document.getElementById("taskList");

  const API_BASE = "https://schedulemanagerbackend-49kg.onrender.com";

  // Load tasks from backend
  fetch(`${API_BASE}/tasks`)
    .then(res => res.json())
    .then(tasks => {
      tasks.forEach(task => {
        addTaskToDOM(task);
        addTaskToCalendar(task);
      });
    })
    .catch(err => console.error("Error loading tasks:", err));

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
          time: timeInput.value
        })
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

  // Complete task
  taskList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("complete-btn")) {
      const taskId = e.target.dataset.id;
      try {
        await fetch(`${API_BASE}/tasks/${taskId}/complete`, { method: "PUT" });
        e.target.parentElement.classList.toggle("completed");
      } catch (err) {
        console.error("Error completing task:", err);
      }
    }

    // Delete task
    if (e.target.classList.contains("delete-btn")) {
      const taskId = e.target.dataset.id;
      try {
        await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
        e.target.parentElement.remove();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  });

  // Function to add task to DOM
  function addTaskToDOM(task) {
    const li = document.createElement("li");
    li.textContent = `${task.name} - ${task.date} ${task.time}`;
    li.className = task.completed ? "completed" : "";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.className = "complete-btn";
    completeBtn.dataset.id = task._id;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.className = "delete-btn";
    deleteBtn.dataset.id = task._id;

    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  }

  // Dummy function for calendar integration
  function addTaskToCalendar(task) {
    // Implement your calendar logic here
  }
});
