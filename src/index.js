import "./styles.css";

class Project {
    constructor(name) {
        this.name = name,
        this.id = crypto.randomUUID();
        this.tasks = [];
        this.isActive = false;
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

primalArray[0].tasks.push(new Task('example task 1', 'example description', 'whenever', 'whatever'));
primalArray[0].tasks[0].isActive = false;
primalArray[0].tasks.push(new Task('example task 2', 'example description 2', 'whenever 2', 'whatever 2'));
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
    input.required = true;

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

const newPrjBtn = document.createElement('button');
newPrjBtn.textContent = 'New Project';

newPrjBtn.addEventListener('click', () => {
    const dialog = document.createElement('dialog');
    const form = document.createElement('form');

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Confirm';
    btn.className = 'new-project-submit-button';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        primalArray.push(new Project(fd.get('project-name')))
        refresh();
    })

    form.appendChild(labelFactory('project-name', 'text', 'Enter name: '));
    form.appendChild(btn);
    dialog.appendChild(form);
    contentDiv.appendChild(dialog);
    dialog.showModal();
})

newPrjBtnDiv.appendChild(newPrjBtn);


function refresh() {
    contentDiv.textContent = '';

    primalArray.forEach(project => {
        const projectContainer = document.createElement('div');
        projectContainer.className = 'project';

        const projectHead = document.createElement('div');
        projectHead.className = 'project-name';
        
        projectHead.addEventListener('click', () => {
            project.isActive = (!project.isActive) ? true : false;
            refresh();
        })

        const title = document.createElement('h2');
        title.textContent = project.name;

        const button = document.createElement('button');
        button.textContent = 'Remove';
        button.addEventListener('click', () => {
            primalArray.splice(primalArray.indexOf(project), 1);
            refresh();
        })

        projectHead.appendChild(title);
        projectHead.appendChild(button);
        projectContainer.appendChild(projectHead);

        if (project.isActive) {
            const projectBody = document.createElement('div');
            projectBody.className = 'tasks';
            taskFill(project, projectBody)

            const newTaskBtn = document.createElement('button');
            newTaskBtn.textContent = 'New Task';

            newTaskBtn.addEventListener('click', () => {
                const dialog = document.createElement('dialog');
                const form = document.createElement('form');

                const btn = document.createElement('button');
                btn.type = 'submit';
                btn.textContent = 'Confirm';
                btn.className = 'new-task-submit-button';

                form.appendChild(labelFactory('task-name', 'text', 'Name: '));
                form.appendChild(labelFactory('task-description', '', 'Description: ', 'textarea'));
                form.appendChild(labelFactory('task-due-date', 'date', 'Due date: '));

                const select = labelFactory('task-priority', '', 'Priority: ', 'select');
                select.el.appendChild(optionFactory('none'));
                select.el.appendChild(optionFactory('low'));
                select.el.appendChild(optionFactory('medium'));
                select.el.appendChild(optionFactory('high'));
                select.el.appendChild(optionFactory('ABSOLUTE'));

                form.appendChild(select);

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const fd = new FormData(form);
                    project.tasks.push(new Task(fd.get('task-name'), fd.get('task-description'), fd.get('task-due-date'), fd.get('task-priority')));
                    refresh();
                })

                form.appendChild(btn);
                dialog.appendChild(form);
                contentDiv.appendChild(dialog);
                dialog.showModal();
            })

            projectContainer.appendChild(newTaskBtn);
            projectContainer.appendChild(projectBody);
        };

        contentDiv.appendChild(projectContainer);
    });
}

function taskFill(project, divTarget) {
    project.tasks.forEach(task => {
        function helper(type, src, dad, className = '') {
            const element = document.createElement(type);
            element.textContent = src;
            element.className = className;
            dad.appendChild(element);
            return element;
        }

        const div = helper('div', '', divTarget, 'task-name');
        helper('h4', task.name, div);

        div.addEventListener('click', () => {
            task.isActive = (!task.isActive) ? true : false;
            refresh();
        })

        if (task.isActive) {
            const taskBody = helper('div', '', divTarget, 'task-body');
            helper('p', `Description: ${task.desc}`, taskBody);
            helper('p', `Creation date: ${task.date}`, taskBody);
            helper('p', `Due date: ${task.due}`, taskBody);
            helper('p', `Priority: ${task.prio}`, taskBody);
        }
    })
}

refresh()