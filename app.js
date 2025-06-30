document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    function renderTasks() {
        taskList.innerHTML = '';
        const currentFilter = document.querySelector('.filter-btn.active').dataset.filter;

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
        });

        if (filteredTasks.length === 0 && currentFilter !== 'all') {
            const noTasksMessage = document.createElement('li');
            noTasksMessage.className = 'no-tasks-message';
            noTasksMessage.textContent = `Nenhuma tarefa ${currentFilter === 'pending' ? 'pendente' : 'concluída'}.`;
            taskList.appendChild(noTasksMessage);
        } else if (filteredTasks.length === 0 && currentFilter === 'all' && tasks.length === 0) {
            const noTasksMessage = document.createElement('li');
            noTasksMessage.className = 'no-tasks-message';
            noTasksMessage.textContent = 'Nenhuma tarefa adicionada ainda. Que tal adicionar uma?';
            taskList.appendChild(noTasksMessage);
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            li.draggable = true;

            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="complete-btn" title="Marcar como ${task.completed ? 'pendente' : 'concluída'}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="edit-btn" title="Editar tarefa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" title="Excluir tarefa">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
        updateProgress();
        saveTasks();
    }
    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        if (text === '') {
            alert('Por favor, digite uma tarefa.');
            return;
        }
        const newTask = {
            id: Date.now(),
            text,
            completed: false
        };
        tasks.push(newTask);
        taskInput.value = '';
        renderTasks();
    });
    taskList.addEventListener('click', (e) => {
        const li = e.target.closest('.task-item');
        if (!li) return;

        const taskId = parseInt(li.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (e.target.closest('.complete-btn')) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            renderTasks();
        } else if (e.target.closest('.edit-btn')) {
            const newText = prompt('Editar tarefa:', tasks[taskIndex].text);
            if (newText !== null && newText.trim() !== '') {
                tasks[taskIndex].text = newText.trim();
                renderTasks();
            }
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                tasks.splice(taskIndex, 1);
                renderTasks();
            }
        }
    });
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks();
        });
    });
    function updateProgress() {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${completedTasks}/${totalTasks} Tarefas Concluídas`;
    }


    clearCompletedBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todas as tarefas concluídas?')) {
            tasks = tasks.filter(task => !task.completed);
            renderTasks();
        }
    });

  
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    let draggedItem = null;

    taskList.addEventListener('dragstart', (e) => {
        draggedItem = e.target.closest('.task-item');
        setTimeout(() => {
            draggedItem.classList.add('dragging');
        }, 0);
    });

    taskList.addEventListener('dragend', () => {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const currentDraggable = document.querySelector('.dragging');
        if (afterElement == null) {
            taskList.appendChild(currentDraggable);
        } else {
            taskList.insertBefore(currentDraggable, afterElement);
        }
    });

    taskList.addEventListener('drop', () => {
        const newOrder = Array.from(taskList.children).map(item => {
            const taskId = parseInt(item.dataset.id);
            return tasks.find(task => task.id === taskId);
        });
        tasks = newOrder;
        saveTasks();
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: -Infinity }).element;
    }
    renderTasks();
});

