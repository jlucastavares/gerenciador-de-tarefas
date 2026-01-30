const addButton = document.querySelector('.add');
const inputTask = document.getElementById('input-task');
const containerTodo = document.getElementById('container-todo');
// Seleciona as colunas e tsks iniciais
const columns = document.querySelectorAll('.column');
const initialTasks = document.querySelectorAll('.task');
// Seleção do modal de edição
const modal = document.getElementById('modal-edit');
const modalInput = document.getElementById('modal-input');
const modalSaveBtn = document.getElementById('modal-save');
const modalCancelBtn = document.getElementById('modal-cancel');

let draggedTask = null;

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
    if (modalInput.value.trim() !== "") {
        currentTaskTextElement.textContent = modalInput.value.trim();
        closeModal();
    }
});

modalInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        modalSaveBtn.click();
    }
});

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

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    task.appendChild(textSpan);
    task.appendChild(actionsDiv);

    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Impede que o clique ative o "arrastar"
        task.remove();
    });

    editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openModal(textSpan);
    });

    attachDragEvents(task); 
    return task;
}

// função para eventos de drag arrastar e soltar
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

//função para adicionar novas tarefas
function addTask() {
    if (inputTask.value.trim() === '') return;

    // Chama a função nova que cria tudo estruturado
    const newTask = createTaskElement(inputTask.value.trim());
    
    containerTodo.appendChild(newTask);
    
    inputTask.value = '';
    inputTask.focus();
}

// adiciona eventos para as tasks que ja foram criadas no html
initialTasks.forEach(task => attachDragEvents(task));

// adiciona evento ao botão de adicionar tarefa
addButton.addEventListener('click', addTask);

// adiciona suporte à tecla ENTER
inputTask.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Lógica das colunas
columns.forEach(column => {
    // Quando arrastar por cima
    column.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over'); // Adiciona classe CSS em vez de mudar estilo direto
    });

    // Quando sair de cima
    column.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });

    // Quando soltar
    column.addEventListener('drop', function() {
        this.classList.remove('drag-over');
        if (draggedTask) {
            this.querySelector('.task-container').appendChild(draggedTask);
        }
    });
});