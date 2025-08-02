function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(id);
  if (page) page.style.display = 'block';
}

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const pageId = link.getAttribute('href').substring(1);
    showPage(pageId);
  });
});

showPage('deliveries');

let people = JSON.parse(localStorage.getItem('people')) || [];
let boxData = JSON.parse(localStorage.getItem('boxData')) || {};

function savePeople() {
  localStorage.setItem('people', JSON.stringify(people));
}

function saveBoxData() {
  localStorage.setItem('boxData', JSON.stringify(boxData));
}

function renderPeople() {
  const list = document.getElementById('people-list');
  list.innerHTML = '';
  people.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    list.appendChild(li);
  });
}

function renderBoxes() {
  const container = document.getElementById('boxes');
  container.innerHTML = '';
  for (let i = 1; i <= 500; i++) {
    const box = document.createElement('div');
    box.className = 'box-item';
    box.innerHTML = `
      <strong>سبد ${i}</strong><br>
      <select data-box="${i}">
        <option value="">-- انتخاب --</option>
        ${people.map(p => `<option value="${p}" ${boxData[i] === p ? 'selected' : ''}>${p}</option>`).join('')}
      </select>
    `;
    container.appendChild(box);
  }
}

function updateBox(e) {
  const select = e.target;
  const id = select.getAttribute('data-box');
  const value = select.value;
  if (id) {
    boxData[id] = value;
    saveBoxData();
  }
}

document.getElementById('boxes').addEventListener('change', updateBox);

document.getElementById('add-person').addEventListener('click', () => {
  const name = document.getElementById('person-name').value.trim();
  if (name && !people.includes(name)) {
    people.push(name);
    savePeople();
    renderPeople();
    renderBoxes();
    document.getElementById('person-name').value = '';
  }
});

renderPeople();
renderBoxes();

function generateReports() {
  const type = document.getElementById('report-type').value;
  const output = document.getElementById('report-output');
  output.innerHTML = '';

  if (type === 'person') {
    const report = {};
    for (let i = 1; i <= 500; i++) {
      const name = boxData[i];
      if (!name) continue;
      if (!report[name]) report[name] = [];
      report[name].push(i);
    }
    for (const name in report) {
      const div = document.createElement('div');
      div.textContent = `${name}: ${report[name].join(', ')}`;
      output.appendChild(div);
    }
  } else {
    for (let i = 1; i <= 500; i++) {
      const name = boxData[i] || 'None';
      const div = document.createElement('div');
      div.textContent = `سبد ${i}: ${name}`;
      output.appendChild(div);
    }
  }
}

document.getElementById('generate-report').addEventListener('click', generateReports);

// Load jsPDF dynamically
import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(jsPDFModule => {
  window.jsPDF = jsPDFModule.jsPDF;
});

document.getElementById('download-pdf').addEventListener('click', () => {
  const doc = new jsPDF();
  const content = document.getElementById('report-output').textContent;
  const lines = content.match(/.{1,80}/g);
  lines.forEach((line, i) => doc.text(line, 10, 10 + i * 10));
  doc.save('report.pdf');
});