import "./styles.css";

function Project(name) {
    this.name = name,
    this.id = crypto.randomUUID();
    this.tasks = [];
}

const projectsArr = JSON.parse(localStorage.getItem("projects")) || [new Project('Default')];


const content = document.querySelector('.content');
const stupid = document.querySelector('.new-projects-button-div');
const projectsDiv = document.querySelector('.projects');

const newPrjBtn = document.createElement('button');
newPrjBtn.textContent = 'New Project';

newPrjBtn.addEventListener('click', () => {
    const dialog = document.createElement('dialog');
    const form = document.createElement('form');

    const label = document.createElement('label');
    label.htmlFor = 'new-project-input';
    label.className = 'new-project-name';
    label.textContent = 'Enter name: ';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'project-name';
    input.id = 'new-project-input';
    input.required = true;

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Confirm';
    btn.className = 'new-project-submit-button';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        projectsArr.push(new Project(fd.get('project-name')))
        fill();
    })

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(btn);
    dialog.appendChild(form);
    projectsDiv.appendChild(dialog);
    dialog.showModal();
})

stupid.appendChild(newPrjBtn);


function fill() {
    projectsDiv.textContent = '';

    projectsArr.forEach(project => {
        const projectDiv = document.createElement('div');

        const title = document.createElement('h2');
        title.textContent = project.name;

        const button = document.createElement('button');
        button.textContent = 'Remove';
        button.addEventListener('click', () => {
            projectsArr.splice(projectsArr.indexOf(project), 1);
            fill();
        })

        projectDiv.appendChild(title);
        projectDiv.appendChild(button);
        projectsDiv.appendChild(projectDiv);
    });
}

fill()