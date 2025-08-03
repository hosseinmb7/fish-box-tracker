let assignments = JSON.parse(localStorage.getItem("assignments")) || {};
let people = JSON.parse(localStorage.getItem("people")) || [];

function saveData() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
  localStorage.setItem("people", JSON.stringify(people));
}

function addPerson() {
  const nameInput = document.getElementById("person-name");
  const name = nameInput.value.trim();
  if (name && !people.includes(name) && name !== "انبار") {
    people.push(name);
    saveData();
    nameInput.value = "";
    renderPeople();
    renderAssignSelect();
  }
}

function deletePerson(name) {
  if (name === "انبار") return;
  if (confirm(`آیا مطمئن هستید که "${name}" حذف شود؟`)) {
    people = people.filter(p => p !== name);
    Object.keys(assignments).forEach(key => {
      if (assignments[key] === name) assignments[key] = "انبار";
    });
    saveData();
    renderPeople();
    renderBoxes();
    renderReports();
    renderWarehouse();
    renderAssignSelect();
  }
}

function renderPeople() {
  const list = document.getElementById("people-list");
  list.innerHTML = "";
  people.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    if (name !== "انبار") {
    const del = document.createElement("span");
    del.textContent = "❌";
    del.style.float = "left";
    del.style.cursor = "pointer";
    del.onclick = () => deletePerson(name);
        li.appendChild(del);
  }
    list.appendChild(li);
  });
}

function renderBoxes() {
  const container = document.getElementById("boxes");
  container.innerHTML = "";
  for (let i = 1; i <= 500; i++) {
    const div = document.createElement("div");
    div.className = "box-item";
    const person = assignments[i];
    div.innerHTML = `سبد ${i} - ${person && person !== "انبار" ? person : ""}`;
    const select = document.createElement("select");
    people.forEach(p => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      if (p === (person || "انبار")) option.selected = true;
      select.appendChild(option);
    });
    select.onchange = () => {
      assignments[i] = select.value;
      saveData();
      renderWarehouse();
    };
    div.appendChild(select);
    container.appendChild(div);
  }
}

function renderAssignSelect() {
  const select = document.getElementById("person-select");
  select.innerHTML = "";
  people.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    select.appendChild(option);
  });
  updateAssignedList();
}

function assignBoxToPerson() {
  const person = document.getElementById("person-select").value;
  const input = document.getElementById("box-input");
  const number = parseInt(input.value);
  if (number >= 1 && number <= 500) {
    assignments[number] = person;
    saveData();
    input.value = "";
    document.getElementById("assign-success").style.display = "block";
    setTimeout(() => {
      document.getElementById("assign-success").style.display = "none";
    }, 1500);
    renderBoxes();
    renderWarehouse();
    updateAssignedList();
  }
}

function updateAssignedList() {
  const person = document.getElementById("person-select").value;
  const list = document.getElementById("assigned-boxes-list");
  list.innerHTML = "";
  Object.keys(assignments).forEach(key => {
    if (assignments[key] === person) {
      const li = document.createElement("li");
      li.textContent = `سبد ${key}`;
      list.appendChild(li);
    }
  });
}

function renderReports() {
  const output = document.getElementById("report-output");
  const type = document.getElementById("report-type").value;
  output.innerHTML = "";

  if (type === "by-person") {
    people.filter(p => p !== "انبار").forEach(name => {
      const list = Object.keys(assignments).filter(k => assignments[k] === name);
      const div = document.createElement("div");
      div.innerHTML = `<strong>${name}</strong>: ${list.length ? list.map(k => `سبد ${k}`).join("، ") : "هیچ سبدی ندارد"}`;
      output.appendChild(div);
    });
  } else {
    let sortedKeys = Object.keys(assignments).filter(k => assignments[k]);
    sortedKeys.sort((a, b) => {
      const pa = assignments[a];
      const pb = assignments[b];
      if (pa === pb) return a - b;
      if (pa === "انبار") return 1;
      if (pb === "انبار") return -1;
      return pa.localeCompare(pb);
    });
    sortedKeys.forEach(k => {
      const div = document.createElement("div");
      div.textContent = `سبد ${k} - ${assignments[k]}`;
      output.appendChild(div);
    });
  }
}

function downloadReport() {
  const type = document.getElementById("report-type").value;
  let text = "";

  if (type === "by-person") {
    people.filter(p => p !== "انبار").forEach(name => {
      const list = Object.keys(assignments).filter(k => assignments[k] === name);
      text += `${name}:\n${list.length ? list.map(k => `سبد ${k}`).join("، ") : "هیچ سبدی ندارد"}\n\n`;
    });
  } else {
    let sortedKeys = Object.keys(assignments).filter(k => assignments[k]);
    sortedKeys.sort((a, b) => {
      const pa = assignments[a];
      const pb = assignments[b];
      if (pa === pb) return a - b;
      if (pa === "انبار") return 1;
      if (pb === "انبار") return -1;
      return pa.localeCompare(pb);
    });
    sortedKeys.forEach(k => {
      text += `سبد ${k} - ${assignments[k]}\n`;
    });
  }

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "report.txt";
  a.click();
}

function renderWarehouse() {
  const container = document.getElementById("warehouse-pages");
  container.innerHTML = "";
  for (let page = 0; page < 5; page++) {
    const div = document.createElement("div");
    div.className = "warehouse-page";
    for (let i = 1 + page * 100; i <= (page + 1) * 100; i++) {
      const box = document.createElement("div");
      box.className = "warehouse-box";
      const person = assignments[i] || "انبار";
      box.style.backgroundColor = person === "انبار" ? "#90ee90" : "#ffff99";
      box.textContent = person === "انبار" ? i : `${i} - ${person}`;
      div.appendChild(box);
    }
    container.appendChild(div);
  }
}

function setupPages() {
  document.querySelectorAll("nav a").forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      const target = link.getAttribute("data-page");
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      document.getElementById(target).classList.add("active");
      if (target === "assign-page") renderBoxes();
      if (target === "people-page") renderPeople();
      if (target === "report-page") renderReports();
      if (target === "warehouse-page") renderWarehouse();
    };
  });

  document.getElementById("report-type").onchange = renderReports;
  document.getElementById("assign-mode").onchange = e => {
    document.getElementById("assign-by-number").style.display = e.target.value === "number" ? "block" : "none";
    document.getElementById("assign-by-person").style.display = e.target.value === "person" ? "block" : "none";
  };
  document.getElementById("person-select").onchange = updateAssignedList;
}

// Initialize
if (!people.includes("انبار")) people.unshift("انبار");
setupPages();
renderPeople();
renderAssignSelect();
renderBoxes();
renderWarehouse();
renderReports();
