// Datu glabāšanas atslēga
const STORAGE_KEY = "pd1-uzdevumi";

// HTML elementu iegūšana
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll("[data-filter]");

// Sākotnējie dati un filtrs
let tasks = loadTasks();
let currentFilter = "all";

// Ielādē saglabātos uzdevumus
function loadTasks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const parsed = data ? JSON.parse(data) : [];

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(task =>
            task !== null &&
            typeof task === "object" &&
            Number.isSafeInteger(task.id) &&
            typeof task.text === "string" &&
            typeof task.done === "boolean"
        );
    } catch {
        return [];
    }
}

// Saglabā uzdevumus pārlūka atmiņā
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
        alert("Neizdevās saglabāt uzdevumus pārlūka atmiņā.");
    }
}

// Izveido unikālu uzdevuma identifikatoru
function generateId() {
    let id = Date.now();

    while (tasks.some(task => task.id === id)) {
        id++;
    }

    return id;
}

// Pievieno jaunu uzdevumu
function addTask(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        return;
    }

    tasks.push({
        id: generateId(),
        text: text,
        done: false
    });

    taskInput.value = "";
    taskInput.focus();

    updateTasks();
}

// Maina uzdevuma izpildes statusu
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.done = !task.done;
        updateTasks();
    }
}

// Dzēš izvēlēto uzdevumu
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    updateTasks();
}

// Atlasa uzdevumus atbilstoši filtram
function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter(task => !task.done);
    }

    if (currentFilter === "completed") {
        return tasks.filter(task => task.done);
    }

    return tasks;
}

// Izveido viena uzdevuma HTML elementu
function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.classList.toggle("completed", task.done);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Atzīmēt: " + task.text);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Dzēst";
    deleteButton.setAttribute("aria-label", "Dzēst: " + task.text);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, text, deleteButton);

    return li;
}

// Attēlo uzdevumu sarakstu
function renderTasks() {
    taskList.replaceChildren();

    getFilteredTasks().forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });

    updateCounter();
}

// Atjauno atlikušo uzdevumu skaitītāju
function updateCounter() {
    const remaining = tasks.filter(task => !task.done).length;
    counter.textContent = `Atlikuši ${remaining} uzdevumi`;
}

// Maina aktīvo filtru
function setFilter(filter) {
    currentFilter = filter;

    filterButtons.forEach(button => {
        const selected = button.dataset.filter === filter;

        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    renderTasks();
}

// Saglabā datus un atjauno sarakstu
function updateTasks() {
    saveTasks();
    renderTasks();
}

// Apstrādā pogu "Pievienot" un Enter taustiņu
taskForm.addEventListener("submit", addTask);

// Apstrādā filtru pogu nospiešanu
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        setFilter(button.dataset.filter);
    });
});

// Attēlo uzdevumus pēc lietotnes atvēršanas
renderTasks();
