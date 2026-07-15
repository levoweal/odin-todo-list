import "./styles.css";

class Project {
    constructor(name) {
        this.name = name;
        this.id = crypto.randomUUID();
        this.tasks = [];
        this.isActive = true;
    }
}

class Task {
    constructor(name, desc, due, prio) {
        this.name = name;
        this.desc = desc;
        this.date = new Date().toISOString().split('T')[0];
        this.due = due;
        this.prio = prio;
        this.isActive = true;
        this.edit = {
            desc: false,
            due: false,
            prio: false
        };
        this.id = crypto.randomUUID();
    }
}

const primalArray = JSON.parse(localStorage.getItem("projects")) || [new Project('Default')];

//this is for testing purposes
/*
primalArray[0].tasks.push(new Task('example task 1', 'example description', '2026-01-01', 'none'));
primalArray[0].tasks[0].isActive = true;
primalArray[0].tasks.push(new Task('example task 2', 'example description 2', '2000-09-11', 'low'));
primalArray[0].tasks[1].isActive = false;
*/

const content = document.querySelector('.content');
const newPrjBtnDiv = document.querySelector('.new-projects-button-div');
const contentDiv = document.querySelector('.projects');

function saveData() {
    localStorage.setItem("projects", JSON.stringify(primalArray));
}

function labelFactory(id, type, text, tag = 'input') {
    const div = document.createElement('div');
    div.className = `${id}-con`;

    const label = document.createElement('label');
    label.htmlFor = `${id}-input`;
    label.className = `${id}-label`;
    label.textContent = text;

    const input = document.createElement(tag);
    if (tag === 'input') {input.type = type};
    input.name = id;
    input.id = `${id}-input`;
    input.required = false;

    div.appendChild(label);
    div.appendChild(input);

    div.el = input;

    return div;
}

function optionFactory(value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
}

function elementFactory(type, text, className = '') {
    const element = document.createElement(type);
    element.textContent = text;
    element.className = className;
    return element;
}

function smartEdit(task, taskProp, titleText, className) {
    let container;
    let title;
    let content;

    if (!task.edit[taskProp]) {
        container = elementFactory('div', '', className);
        title = elementFactory('span', titleText);
        content = elementFactory('span', task[taskProp]);
        container.appendChild(title);
        container.appendChild(content);
    } else {
        if (taskProp === 'desc') {
            container = labelFactory(`${className}-${task.id}`, '', titleText, 'textarea');
        }
        if (taskProp === 'due') {
            container = labelFactory(`${className}-${task.id}`, 'date', titleText);
        }
        if (taskProp === 'prio') {
            container = labelFactory(`${className}-${task.id}`, '', titleText, 'select');
            container.el.appendChild(optionFactory('none'));
            container.el.appendChild(optionFactory('low'));
            container.el.appendChild(optionFactory('medium'));
            container.el.appendChild(optionFactory('high'));
            container.el.appendChild(optionFactory('ABSOLUTE'));
        }
        container.el.value = task[taskProp];
        container.el.addEventListener('blur', () => {
            task[taskProp] = container.el.value;
            task.edit[taskProp] = !task.edit[taskProp];
            saveData();
            refresh();
        });
    }

    container.addEventListener('dblclick', () => {
        task.edit[taskProp] = !task.edit[taskProp];
        refresh();
        setTimeout(() => {
            const el = document.querySelector(`#${className}-${task.id}-input`);
            if (el) {el.focus()};
        }, 0);
    })

    return container;
}

//project form callback
function projectForm(project) {
    const dialog = elementFactory('dialog', '', 'new-project-dialog');
    const form = elementFactory('form', '', 'new-project-form');

    const title = labelFactory('project-name', 'text', 'Enter name: ');
    title.el.required = true;
    if (project) title.el.value = project.name;

    const submitBtn = elementFactory('button', 'Confirm', 'new-project-submit');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        if (project) {
            project.name = fd.get('project-name')
        } else {
            primalArray.push(new Project(fd.get('project-name')));
        }
        saveData();
        refresh();
    })

    const cancelBtn = elementFactory('button', 'Cancel', 'new-project-cancel');
    cancelBtn.addEventListener('click', refresh);

    form.appendChild(title);
    
    form.appendChild(submitBtn);
    form.appendChild(cancelBtn);

    dialog.appendChild(form);
    contentDiv.appendChild(dialog);

    dialog.showModal();
}

//task form callback
function taskForm(project, task) {
    const dialog = elementFactory('dialog', '', 'new-task-dialog');
    const form = elementFactory('form', '', 'new-task-form');

    const submitBtn = elementFactory('button', 'Confirm', 'new-task-submit');

    const cancelBtn = elementFactory('button', 'Cancel', 'new-task-cancel');
    cancelBtn.addEventListener('click', refresh);

    const title = labelFactory('task-name', 'text', 'Name: ');
    title.el.required = true;
    if (task) title.el.value = task.name;

    const description = labelFactory('task-description', '', 'Description: ', 'textarea');
    if (task) description.el.value = task.desc;

    const dueDate = labelFactory('task-due-date', 'date', 'Due date: ');
    if (task) dueDate.el.value = task.due;

    const select = labelFactory('task-priority', '', 'Priority: ', 'select');
    select.el.appendChild(optionFactory('none'));
    select.el.appendChild(optionFactory('low'));
    select.el.appendChild(optionFactory('medium'));
    select.el.appendChild(optionFactory('high'));
    select.el.appendChild(optionFactory('ABSOLUTE'));
    if (task) select.el.value = task.prio;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        if (task) {
            task.name = fd.get('task-name');
            task.desc = fd.get('task-description');
            task.due = fd.get('task-due-date');
            task.prio = fd.get('task-priority');
        } else {
            project.tasks.push(new Task(fd.get('task-name'), fd.get('task-description'), fd.get('task-due-date'),  fd.get('task-priority')));
        }
        saveData();
        refresh();
    })

    form.appendChild(title);
    form.appendChild(description);
    form.appendChild(dueDate);
    form.appendChild(select);

    form.appendChild(submitBtn);
    form.appendChild(cancelBtn);

    dialog.appendChild(form);
    contentDiv.appendChild(dialog);

    dialog.showModal();
}

//new project form
const newPrjBtn = document.createElement('button');
newPrjBtn.textContent = 'New Project';
newPrjBtn.addEventListener('click', () => projectForm());
newPrjBtnDiv.appendChild(newPrjBtn);

//whole page rebuild
function refresh() {
    contentDiv.textContent = '';

    //projects draw
    primalArray.forEach(project => {
        const projectContainer = elementFactory('div', '', 'project');

        const projectHead = elementFactory('div', '', 'project-head');
        //project expand
        projectHead.addEventListener('click', (e) => {
            if (e.target === editBtn) return;
            project.isActive = !project.isActive;
            refresh();
        })

        const title = elementFactory('h2', project.name, 'project-name');

        const removeBtn = elementFactory('button', 'Remove', 'project-remove-button');
        removeBtn.addEventListener('click', () => {
            primalArray.splice(primalArray.indexOf(project), 1);
            refresh();
        })

        const editBtn = elementFactory('button', 'Edit', 'project-edit-button');
        editBtn.addEventListener('click', () => projectForm(project));

        projectHead.appendChild(title);
        projectHead.appendChild(editBtn);
        projectHead.appendChild(removeBtn);
        projectContainer.appendChild(projectHead);

        //tasks draw
        if (project.isActive) {
            const projectBody = elementFactory('div', '', 'tasks');
            fillTasks(project, projectBody);

            //new task form
            const newTaskBtn = elementFactory('button', 'New Task', 'new-task-button');
            newTaskBtn.addEventListener('click', () => taskForm(project));

            projectContainer.appendChild(newTaskBtn);
            projectContainer.appendChild(projectBody);
        };

        contentDiv.appendChild(projectContainer);
    });
}

//tasks titles draw
function fillTasks(project, dad) {
    project.tasks.forEach(task => {
        const container = elementFactory('div', '', 'task');

        const taskHead = elementFactory('div', '', 'task-head');

        const title = elementFactory('h4', task.name, 'task-name');

        const removeBtn = elementFactory('button', 'Remove', 'task-remove-button');
        removeBtn.addEventListener('click', () => {
            project.tasks.splice(project.tasks.indexOf(task), 1);
            refresh();
        })

        const editBtn = elementFactory('button', 'Edit', 'task-edit-button');
        editBtn.addEventListener('click', () => {taskForm(project, task)});

        taskHead.appendChild(title)
        taskHead.appendChild(editBtn);
        taskHead.appendChild(removeBtn);

        container.appendChild(taskHead);

        //task expand
        taskHead.addEventListener('click', (e) => {
            if (e.target === editBtn) return;
            task.isActive = !task.isActive;
            refresh();
        })

        //task properties draw
        if (task.isActive) {
            const taskBody = elementFactory('div', '', 'task-body');

            const desc = smartEdit(task, 'desc', 'Description: ', 'task-description');

            const date = elementFactory('div', '', 'task-date');
            date.appendChild(elementFactory('p', `Creation date: ${task.date}`));

            const due = smartEdit(task, 'due', 'Due Date: ', 'task-due');

            const prio = smartEdit(task, 'prio', 'Priority: ', 'task-priority');
            
            taskBody.appendChild(desc);
            taskBody.appendChild(date);
            taskBody.appendChild(due);
            taskBody.appendChild(prio);

            container.appendChild(taskBody);
        }

        dad.appendChild(container);
    })
}

refresh()