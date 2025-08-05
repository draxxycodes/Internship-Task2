// DOM Elements
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDate');
const prioritySelect = document.getElementById('priority');
const addTaskButton = document.getElementById('addTask');
const tasksList = document.getElementById('tasksList');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortTasks');
const clearCompletedButton = document.getElementById('clearCompleted');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasksCount');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    updateTaskCount();
});

addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

sortSelect.addEventListener('change', renderTasks);

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.id.replace('Tasks', '');
        renderTasks();
    });
});

clearCompletedButton.addEventListener('click', clearCompletedTasks);

// Functions
function addTask() {
    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;
    
    if (text) {
        const newTask = {
            id: Date.now(),
            text,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        // Reset inputs
        taskInput.value = '';
        dueDateInput.value = '';
        prioritySelect.value = 'low';
        taskInput.focus();
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? {...task, completed: !task.completed} : task
    );
    saveTasks();
    renderTasks();
    updateTaskCount();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

function updateTaskCount() {
    totalTasksSpan.textContent = tasks.length;
    completedTasksSpan.textContent = tasks.filter(task => task.completed).length;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
}

function renderTasks() {
    let filteredTasks = tasks;
    
    // Apply filter
    switch(currentFilter) {
        case 'active':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
    }
    
    // Apply sort
    switch(sortSelect.value) {
        case 'priority':
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
        case 'dueDate':
            filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case 'alphabetical':
            filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
            break;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                ${task.dueDate ? `<span class="task-date">${formatDate(task.dueDate)}</span>` : ''}
                <span class="priority-badge priority-${task.priority}">
                    ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
            </div>
            <div class="task-actions">
                <button onclick="deleteTask(${task.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

// Add drag and drop functionality
let draggedTask = null;

tasksList.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('task-item')) {
        draggedTask = e.target;
        e.target.style.opacity = '0.5';
    }
});

tasksList.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('task-item')) {
        e.target.style.opacity = '1';
    }
});

tasksList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const taskItem = e.target.closest('.task-item');
    if (taskItem && taskItem !== draggedTask) {
        const box = taskItem.getBoundingClientRect();
        const offset = e.clientY - box.top - box.height / 2;
        
        if (offset < 0) {
            taskItem.parentNode.insertBefore(draggedTask, taskItem);
        } else {
            taskItem.parentNode.insertBefore(draggedTask, taskItem.nextSibling);
        }
    }
});
