import "./styles.css";

class Project {
    constructor(name) {
        this.name = name,
        this.id = crypto.randomUUID();
        this.tasks = [];
        this.isActive = true;
    }
}

class Task {
    constructor(name, desc, due, prio) {
        this.name = name;
        this.desc = desc;
        this.date = new Date();
        this.due = due;
        this.prio = prio;
        this.isActive = true;
    }
}

const primalArray = JSON.parse(localStorage.getItem("projects")) || [new Project('Default')];

//this is for testing purposes
primalArray[0].tasks.push(new Task('example task 1', 'example description', '2026-01-01', 'none'));
primalArray[0].tasks[0].isActive = true;
primalArray[0].tasks.push(new Task('example task 2', 'example description 2', '2000-09-11', 'low'));
primalArray[0].tasks[1].isActive = false;


const content = document.querySelector('.content');
const newPrjBtnDiv = document.querySelector('.new-projects-button-div');
const contentDiv = document.querySelector('.projects');

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

//project form callback
function projectForm(project) {
    const dialog = document.createElement('dialog');
    const form = document.createElement('form');

    const title = labelFactory('project-name', 'text', 'Enter name: ');
    title.el.required = true;
    if (project) title.el.value = project.name;

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Confirm';
    submitBtn.className = 'new-project-submit-button';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        if (project) {
            project.name = fd.get('project-name')
        } else {
            primalArray.push(new Project(fd.get('project-name'))) 
        }
        refresh();
    })

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'new-project-calncel-button';
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
    const dialog = document.createElement('dialog');
    const form = document.createElement('form');

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Confirm';
    submitBtn.className = 'new-task-submit-button';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'new-task-calncel-button';
    cancelBtn.addEventListener('click', refresh);

    const title = labelFactory('task-name', 'text', 'Name: ');
    title.el.required = true;
    if (task) title.el.value = task.name;
    form.appendChild(title);

    const description = labelFactory('task-description', '', 'Description: ', 'textarea');
    if (task) description.el.value = task.desc;
    form.appendChild(description);

    const dueDate = labelFactory('task-due-date', 'date', 'Due date: ');
    if (task) dueDate.el.value = task.due;
    form.appendChild(dueDate);

    const select = labelFactory('task-priority', '', 'Priority: ', 'select');
    select.el.appendChild(optionFactory('none'));
    select.el.appendChild(optionFactory('low'));
    select.el.appendChild(optionFactory('medium'));
    select.el.appendChild(optionFactory('high'));
    select.el.appendChild(optionFactory('ABSOLUTE'));
    if (task) select.el.value = task.prio;
    form.appendChild(select);

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
        refresh();
    })

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
        const projectContainer = document.createElement('div');
        projectContainer.className = 'project';

        const projectHead = document.createElement('div');
        projectHead.className = 'project-name';
        
        //project expand
        projectHead.addEventListener('click', (e) => {
            if (e.target === editBtn) return;
            project.isActive = (!project.isActive) ? true : false;
            refresh();
        })

        const title = document.createElement('h2');
        title.textContent = project.name;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-project-button';
        removeBtn.addEventListener('click', () => {
            primalArray.splice(primalArray.indexOf(project), 1);
            refresh();
        })

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-project-button';
        editBtn.addEventListener('click', () => projectForm(project));

        projectHead.appendChild(title);
        projectHead.appendChild(editBtn);
        projectHead.appendChild(removeBtn);
        projectContainer.appendChild(projectHead);

        //tasks draw
        if (project.isActive) {
            const projectBody = document.createElement('div');
            projectBody.className = 'tasks';
            taskFill(project, projectBody)

            //new task form
            const newTaskBtn = document.createElement('button');
            newTaskBtn.textContent = 'New Task';
            
            newTaskBtn.addEventListener('click', () => taskForm(project));

            projectContainer.appendChild(newTaskBtn);
            projectContainer.appendChild(projectBody);
        };

        contentDiv.appendChild(projectContainer);
    });
}

//tasks titles draw
function taskFill(project, divTarget) {
    project.tasks.forEach(task => {
        function elementConstructor(type, src, dad, className = '') {
            const element = document.createElement(type);
            element.textContent = src;
            element.className = className;
            dad.appendChild(element);
            return element;
        }

        const taskHead = elementConstructor('div', '', divTarget, 'task-name');
        elementConstructor('h4', task.name, taskHead);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-task-button';
        removeBtn.addEventListener('click', () => {
            project.tasks.splice(project.tasks.indexOf(task), 1);
            refresh();
        })

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-task-button';
        editBtn.addEventListener('click', () => {taskForm(project, task)});

        taskHead.appendChild(editBtn);
        taskHead.appendChild(removeBtn);

        //task expand
        taskHead.addEventListener('click', (e) => {
            if (e.target === editBtn) return;
            task.isActive = (!task.isActive) ? true : false;
            refresh();
        })

        //task properties draw
        if (task.isActive) {
            const taskBody = elementConstructor('div', '', divTarget, 'task-body');
            if (task.desc) {elementConstructor('p', `Description: ${task.desc}`, taskBody)};
            elementConstructor('p', `Creation date: ${task.date}`, taskBody);
            if (task.due) {elementConstructor('p', `Due date: ${task.due}`, taskBody)};
            elementConstructor('p', `Priority: ${task.prio}`, taskBody);
        }
    })
}

refresh()