const addButton = document.querySelector('.add');
const tasks = document.querySelectorAll('.task');
const columns = document.querySelectorAll('.column');

let draggedTask = null; // Variável para guardar o que estamos arrastando

function addTask() {
    const inputTask = document.getElementById('input-task');
    if (inputTask.value.trim() === '') {
        return; // Não adiciona tarefa vazia
    }   
    const container = document.getElementById('container-todo');

    const task = document.createElement('div');
    task.className = 'task';
    task.setAttribute('draggable', 'true');
    task.textContent = inputTask.value.trim();
    
    task.addEventListener('dragstart', function() {
        draggedTask = this;
        this.classList.add('dragging');
    });

    task.addEventListener('dragend', function() {
        draggedTask = null;
        this.classList.remove('dragging');
    });

    container.appendChild(task);

    inputTask.value = '';
    inputTask.focus();
}


tasks.forEach(task => {
    task.addEventListener('dragstart', function() {
        draggedTask = this; // 'this' é o elemento que foi clicado
        this.classList.add('dragging'); // Adiciona a classe dragging
    });

    // Quando terminar de arrastar
    task.addEventListener('dragend', function() {
        draggedTask = null;
        this.classList.remove('dragging');
    });
});

columns.forEach(column => {
    // O evento 'dragover' é disparado continuamente quando passamos algo por cima
    column.addEventListener('dragover', function(e) {
        e.preventDefault(); // Necessário para permitir o "drop" (soltar)
        this.style.backgroundColor = '#d3d5d8'; // Muda cor da coluna pra dar feedback
    });

    // Quando o mouse sai de cima da coluna
    column.addEventListener('dragleave', function() {
        this.style.backgroundColor = '#e2e4e6'; // Volta a cor original
    });

    // Quando soltamos o item na coluna
    column.addEventListener('drop', function() {
        this.style.backgroundColor = '#e2e4e6'; // Volta a cor original
        // Adiciona a tarefa arrastada dentro do container desta coluna
        // O querySelector pega a div interna onde ficam as tarefas
        this.querySelector('.task-container').appendChild(draggedTask);
    });
});