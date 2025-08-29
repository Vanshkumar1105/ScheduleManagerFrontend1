document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");
  const taskList = document.getElementById("taskList");

  const API_URL = "https://schedulemanagerbackend-49kg.onrender.com"; // ✅ Your Render backend

  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    editable: false,
    events: [],
  });
  calendar.render();

  // Load tasks
  fetch(`${API_URL}/tasks`)
    .then(res => res.json())
    .then(tasks => {
      tasks.forEach(task => {
        addTaskToDOM(task);
        addTaskToCalendar(task);
      });
    });

  // Add task
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
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
  });

  function addTaskToDOM(task) {
    const li = document.createElement("li");
    li.dataset.id = task._id;
    li.innerHTML = `
      <span>${task.name} (${task.date || 'No Date'} ${task.time || 'No Time'})</span>
      <div class="task-buttons">
        <button class="complete">✔</button>
        <button class="delete">❌</button>
      </div>
    `;

    li.querySelector(".complete").addEventListener("click", async () => {
      await fetch(`${API_URL}/tasks/${task._id}/complete`, { method: "PUT" });
      li.classList.toggle("completed");
    });

    li.querySelector(".delete").addEventListener("click", async () => {
      await fetch(`${API_URL}/tasks/${task._id}`, { method: "DELETE" });
      li.remove();
      const event = calendar.getEventById(task._id);
      if (event) event.remove();
    });

    if (task.completed) li.classList.add("completed");
    taskList.appendChild(li);
  }

  function addTaskToCalendar(task) {
    if (!task.date) return;
    let start = task.date;
    if (task.time) start += "T" + task.time;
    calendar.addEvent({id: task._id, title: task.name, start});
  }
});
