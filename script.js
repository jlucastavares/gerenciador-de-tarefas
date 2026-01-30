const addButton = document.querySelector('.add');
const inputTask = document.getElementById('input-task');
const containerTodo = document.getElementById('container-todo');
const columns = document.querySelectorAll('.column');
const modal = document.getElementById('modal-edit');
const modalInput = document.getElementById('modal-input');
const modalSaveBtn = document.getElementById('modal-save');
const modalCancelBtn = document.getElementById('modal-cancel');

let draggedTask = null;
let currentTaskTextElement = null;

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

    // Percorre cada coluna e salva o texto das tarefas
    Object.keys(containers).forEach(key => {
        const container = containers[key];
        const tasks = container.querySelectorAll('.task');
        
        tasks.forEach(task => {
            const textSpan = task.querySelector('span');
            if (textSpan) {
                tasksData[key].push(textSpan.textContent);
            }
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
                        const newTaskElement = createTaskElement(taskText);
                        container.appendChild(newTaskElement);
                    });
                }
            });
        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
            localStorage.removeItem('myKanbanTasks');
        }
    }
}

function openModal(textElement) {
    currentTaskTextElement = textElement;
    modalInput.value = textElement.textContent;
    modal.classList.remove('hidden');
    modalInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    currentTaskTextElement = null;
}

modalCancelBtn.addEventListener('click', closeModal);

modalSaveBtn.addEventListener('click', function() {
    if (modalInput.value.trim() !== "" && currentTaskTextElement) {
        currentTaskTextElement.textContent = modalInput.value.trim();
        saveTasks();
        closeModal();
    }
});

modalInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') modalSaveBtn.click();
});

function attachDragEvents(taskElement) {
    taskElement.addEventListener('dragstart', function() {
        draggedTask = this;
        this.classList.add('dragging');
    });

    taskElement.addEventListener('dragend', function() {
        draggedTask = null;
        this.classList.remove('dragging');
    });
}

function createTaskElement(content) {
    const task = document.createElement('div');
    task.className = 'task';
    task.setAttribute('draggable', 'true');

    const textSpan = document.createElement('span');
    textSpan.textContent = content;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = '<i class="ph ph-pencil-simple"></i>';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '<i class="ph ph-trash"></i>';

    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        task.remove();
        saveTasks(); 
    });

    editBtn.addEventListener('click', function(e) {
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
    if (text === '') return;

    const newTask = createTaskElement(text);
    containerTodo.appendChild(newTask);
    
    saveTasks();
    
    inputTask.value = '';
    inputTask.focus();
}

// Adiciona evento ao botão de adicionar
addButton.addEventListener('click', addTask);

//tecla ENTER no input principal
inputTask.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTask();
});

// Lógica das Colunas
columns.forEach(column => {
    column.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    column.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });

    column.addEventListener('drop', function() {
        this.classList.remove('drag-over');
        if (draggedTask) {
            const container = this.querySelector('.task-container');
            container.appendChild(draggedTask);
            saveTasks();
        }
    });
});

// Carrega as tarefas salvas ao iniciar a página
loadTasks();