const addButton = document.querySelector('.add');
const inputTask = document.getElementById('input-task');
const containerTodo = document.getElementById('container-todo');
const columns = document.querySelectorAll('.column');
const modal = document.getElementById('modal-edit');
const modalInput = document.getElementById('modal-input');
const modalSaveBtn = document.getElementById('modal-save');
const modalCancelBtn = document.getElementById('modal-cancel');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const inputPriority = document.getElementById('input-priority');
const modalPriorityInput = document.getElementById('modal-priority');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');
const inputDeadline = document.getElementById('input-deadline');
const modalDeadlineInput = document.getElementById('modal-deadline');
const dateInputs = document.querySelectorAll('input[type="date"]');

let draggedTask = null;
let currentTaskTextElement = null;

// VERSÃO ROBUSTA DO SAVETASKS (Use esta)
function saveTasks() {
    const tasksData = {
         todo: [], 
         doing: [], 
         done: [] 
    };

    const containers = {
        todo: document.getElementById('container-todo'),
        doing: document.getElementById('container-doing'),
        done: document.getElementById('container-done')
    };

    Object.keys(containers).forEach(key => {
        const container = containers[key];
        const tasks = container.querySelectorAll('.task');

        tasks.forEach(task => {
            // A prioridade e data estão seguras no dataset
            const priority = task.dataset.priority || 'low';
            const deadline = task.dataset.deadline || '';

            const textSpan = task.querySelector('span');
            let text = "";

            textSpan.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent;
                }
            });

            tasksData[key].push({
                text: text.trim(),
                priority: priority,
                deadline: deadline
            });
        });
    });

    localStorage.setItem('myKanbanTasks', JSON.stringify(tasksData));
}

function loadTasks() {
    const savedData = localStorage.getItem('myKanbanTasks');

    if (savedData) {
        try {
            const tasksData = JSON.parse(savedData);

            const containers = {
                todo: document.getElementById('container-todo'),
                doing: document.getElementById('container-doing'),
                done: document.getElementById('container-done')
            };

            // Recria as tarefas
            Object.keys(tasksData).forEach(key => {
                const taskList = tasksData[key];
                const container = containers[key];

                container.innerHTML = '';

                if (Array.isArray(taskList)) {
                    taskList.forEach(taskText => {
                        if (typeof taskText === 'object') {
                            container.appendChild(createTaskElement(taskText.text, taskText.priority, taskText.deadline));
                        } else {
                            container.appendChild(createTaskElement(taskText.text, 'low', ''));
                        }
                    });
                }
            });
        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
            localStorage.removeItem('myKanbanTasks');
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        themeIcon.classList.replace('ph-sun', 'ph-moon');
        localStorage.setItem('kanbanTheme', 'dark');
    } else {
        themeIcon.classList.replace('ph-moon', 'ph-sun');
        localStorage.setItem('kanbanTheme', 'light');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('kanbanTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.replace('ph-sun', 'ph-moon');
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);

function openModal(textElement) {
    currentTaskTextElement = textElement;

    let currentText = "";
    textElement.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) currentText += node.textContent;
    });

    modalInput.value = currentText.trim();

    const taskElement = textElement.closest('.task');
    const currentPriority = taskElement.dataset.priority || 'low';
    const currentDeadline = taskElement.dataset.deadline || '';
    modalPriorityInput.value = currentPriority;
    modalDeadlineInput.value = currentDeadline;
    modal.classList.remove('hidden');
    modalInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    currentTaskTextElement = null;
}

modalCancelBtn.addEventListener('click', closeModal);

modalSaveBtn.addEventListener('click', function () {
    if (modalInput.value.trim() !== "" && currentTaskTextElement) {
        const taskElement = currentTaskTextElement.closest('.task');
        const newPriority = modalPriorityInput.value;
        const newDeadline = modalDeadlineInput.value;

        taskElement.dataset.priority = newPriority;
        taskElement.dataset.deadline = newDeadline;

        currentTaskTextElement.innerHTML = '';

        const newBadge = document.createElement('div');
        newBadge.className = `task-priority priority-${newPriority}`;
        currentTaskTextElement.appendChild(newBadge);

        currentTaskTextElement.appendChild(document.createTextNode(modalInput.value.trim()));

        taskElement.classList.remove('overdue');

        if (newDeadline) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const taskDate = new Date(newDeadline + 'T00:00:00');
            if (taskDate < today) {
                taskElement.classList.add('overdue');
                taskElement.title = "Esta tarefa está atrasada!";
            }
            const deadlineSpan = document.createElement('span');
            deadlineSpan.className = 'task-deadline';
            const dateFormatted = newDeadline.split('-').reverse().join('/');
            deadlineSpan.innerHTML = `<i class="ph ph-clock"></i> ${dateFormatted}`;
            currentTaskTextElement.appendChild(deadlineSpan);
        }   

        saveTasks();
        closeModal();
    }
});

modalInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') modalSaveBtn.click();
});

function attachDragEvents(taskElement) {
    taskElement.addEventListener('dragstart', function () {
        draggedTask = this;
        this.classList.add('dragging');
    });

    taskElement.addEventListener('dragend', function () {
        draggedTask = null;
        this.classList.remove('dragging');
    });
}

function createTaskElement(content, priority = 'low', deadline = '') {
    const task = document.createElement('div');
    task.className = 'task';
    task.setAttribute('draggable', 'true');
    task.dataset.priority = priority;

    task.dataset.deadline = deadline;

    if (deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskDate = new Date(deadline + 'T00:00:00');

        if (taskDate < today) {
            task.classList.add('overdue');
            task.title = "Esta tarefa está atrasada!";
        }
    }

    const textSpan = document.createElement('span');

    const badge = document.createElement('div');
    badge.className = `task-priority priority-${priority}`;

    textSpan.appendChild(badge);
    textSpan.appendChild(document.createTextNode(content));

    if (deadline) {
        const deadlineSpan = document.createElement('span');
        deadlineSpan.className = 'task-deadline';
        const dateFormatted = deadline.split('-').reverse().join('/');
        deadlineSpan.innerHTML = `<i class="ph ph-clock"></i> ${dateFormatted}`;
        textSpan.appendChild(deadlineSpan);
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = '<i class="ph ph-pencil-simple"></i>';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '<i class="ph ph-trash"></i>';

    deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        task.remove();
        saveTasks();
    });

    editBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openModal(textSpan);
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    task.appendChild(textSpan);
    task.appendChild(actionsDiv);

    attachDragEvents(task);

    return task;
}

function addTask() {
    const text = inputTask.value.trim();
    const priority = inputPriority.value;
    const deadline = inputDeadline.value;

    if (text === '') return;

    const newTask = createTaskElement(text, priority, deadline);
    containerTodo.appendChild(newTask);

    saveTasks();

    inputTask.value = '';
    inputTask.focus();
    inputPriority.value = 'low';
    inputDeadline.value = '';
    inputDeadline.classList.remove('has-value');
}

// Adiciona evento ao botão de adicionar
addButton.addEventListener('click', addTask);

//tecla ENTER no input principal
inputTask.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTask();
});

// Lógica das Colunas
columns.forEach(column => {
    column.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    column.addEventListener('dragleave', function () {
        this.classList.remove('drag-over');
    });

    column.addEventListener('drop', function () {
        this.classList.remove('drag-over');
        if (draggedTask) {
            const container = this.querySelector('.task-container');
            container.appendChild(draggedTask);
            saveTasks();
        }
    });
});

function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const allTasks = document.querySelectorAll('.task');

    if (searchTerm !== "") {
        clearSearchBtn.classList.remove('hidden');
    }
    else {
        clearSearchBtn.classList.add('hidden');
    }

    allTasks.forEach(task => {
        const taskText = task.querySelector('span').textContent.toLowerCase();
        if (taskText.includes(searchTerm)) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    })
}

searchInput.addEventListener('input', filterTasks);

clearSearchBtn.addEventListener('click', function () {
    searchInput.value = '';
    filterTasks();
    searchInput.focus();
});

function ajustReponsive() {
    const botao = document.querySelector('.add');
    const larguraTela = window.innerWidth;

    if (larguraTela <= 768) {
        botao.innerHTML = '+ Adicionar Tarefa';
    } else {
        botao.innerHTML = '+';
    }
}

window.addEventListener('resize', ajustReponsive);

dateInputs.forEach(input => {
    const checkValue = () => {
        if (input.value !== "") {
            input.classList.add('has-value');
        } else {
            input.classList.remove('has-value');
        }
    };
    checkValue();
    input.addEventListener('change', checkValue);
    input.addEventListener('blur', checkValue);
    
});

// Carrega as tarefas salvas ao iniciar a página
loadTasks();
loadTheme(); 
ajustReponsive();