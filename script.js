const addButton = document.querySelector('.add');
const inputTask = document.getElementById('input-task');
const containerTodo = document.getElementById('container-todo');
// Seleciona as colunas e tsks iniciais
const columns = document.querySelectorAll('.column');
const initialTasks = document.querySelectorAll('.task');

let draggedTask = null;

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
    if (inputTask.value.trim() === '') return; // Evita adicionar tarefas vazias

    const newTask = document.createElement('div');
    newTask.className = 'task';
    newTask.setAttribute('draggable', 'true');
    newTask.textContent = inputTask.value.trim();

    attachDragEvents(newTask);

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