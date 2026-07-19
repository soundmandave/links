let selectedLink = null;
let selectedPadElement = null;

let currentData = null;

const goButton = document.getElementById("goButton");
const cancelButton = document.getElementById("cancelButton");
const statusLed = document.getElementById("statusLed");
const goInstruction = document.getElementById("goInstruction");

const padGrid = document.getElementById("padGrid");
const tabBar = document.getElementById("tabBar");
const utilityStrip = document.getElementById("utilityStrip");
const display = document.getElementById("mpcDisplay");
const terminalTitle = document.getElementById("terminalTitle");
const displayMenuContainer = document.getElementById("displayMenu");

const goDisplayButtons = document.querySelectorAll(".go-display");
const cancelDisplayButtons = document.querySelectorAll(".cancel-display");

function setGoEnabled(enabled) {
  goButton.disabled = !enabled;
  statusLed.classList.toggle("active", enabled);
  goInstruction.textContent = enabled
    ? "Ready. Press GO to launch."
    : 'Press a Pad then hit <strong>GO</strong> to launch';

  goDisplayButtons.forEach(btn => {
    btn.disabled = !enabled;
  });
}

/* =============================
LOAD JSON
============================= */
fetch("pads.json")
  .then(res => res.json())
  .then(data => {
    currentData = data;
    terminalTitle.textContent = data.headerTitle || "STUDIO TERMINAL";
    display.innerHTML = `
      <h1>${data.artistName}</h1>
      <p>${data.tagline}</p>
    `;

    buildDisplayMenu(data);
    buildUtilityButtons(data);
    buildTabs(data);

    if (data.categories.length > 0) {
      buildPads(data.categories[0].pads, data.artistName);
      applyTheme(data.categories[0]);
    }
  })
  .catch(err => {
    display.innerHTML = "<h1>JSON Error</h1>";
    console.error(err);
  });

/* =============================
DISPLAY MENU
============================= */
function buildDisplayMenu(data) {
  displayMenuContainer.innerHTML = "";
  if (!data.displayMenu) return;

  data.displayMenu.forEach(menuItem => {
    const span = document.createElement("span");
    span.textContent = menuItem.label;
    span.style.cursor = "pointer";

    span.addEventListener("click", () => {
      if (menuItem.type === "content") {
        display.innerHTML = `
          <h1>${menuItem.title}</h1>
          ${menuItem.content}
        `;
      }

      if (menuItem.bankName) {
        const bank = data.categories.find(cat => cat.name === menuItem.bankName);
        if (bank) {
          buildPads(bank.pads, data.artistName);
          applyTheme(bank);
          setActiveTab(bank.name);
        }
      }
    });

    displayMenuContainer.appendChild(span);
  });
}

/* =============================
UTILITY BUTTONS
============================= */
function buildUtilityButtons(data) {
  if (!data.utilityButtons) return;

  data.utilityButtons.forEach(btn => {
    const a = document.createElement("a");
    a.classList.add("utility-btn");
    a.textContent = btn.label;
    a.href = btn.url;
    a.target = "_blank";
    utilityStrip.appendChild(a);
  });
}

/* =============================
TABS
============================= */
function buildTabs(data) {
  tabBar.innerHTML = "";

  data.categories.forEach((category, index) => {
    const tab = document.createElement("button");
    tab.classList.add("tab-button");
    tab.textContent = category.name;

    if (index === 0) tab.classList.add("active");

    tab.addEventListener("click", () => {
      setActiveTab(category.name);
      buildPads(category.pads, data.artistName);
      applyTheme(category);
      display.innerHTML = `
        <h1>${category.name}</h1>
        <p>Pad bank loaded.</p>
      `;
    });

    tabBar.appendChild(tab);
  });
}

function setActiveTab(name) {
  document.querySelectorAll(".tab-button").forEach(t => {
    t.classList.toggle("active", t.textContent === name);
  });
}

/* =============================
BUILD PADS
============================= */
function buildPads(pads, artistName) {
  padGrid.innerHTML = "";
  resetSelection();

  const count = pads.length;

  let displayCount;
  if (count <= 8) displayCount = 8;
  else if (count <= 12) displayCount = 12;
  else displayCount = 16;

  const padded = [...pads];
  while (padded.length < displayCount) padded.push({});

  padded.forEach((pad, index) => {
    const padElement = document.createElement("div");
    padElement.classList.add("pad");

    if (pad.thumbnail) {
      const img = document.createElement("img");
      img.src = "images/" + pad.thumbnail;
      img.style.position = "absolute";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      padElement.appendChild(img);
    }

    const label = document.createElement("div");
    label.classList.add("pad-label");

    // Your template string had missing backticks earlier; ensure it's literal JS:
    label.textContent = pad.padLabel || `PAD ${index + 1}`;

    padElement.appendChild(label);

    padElement.addEventListener("click", () => {
      if (selectedPadElement) selectedPadElement.classList.remove("selected");

      selectedPadElement = padElement;
      selectedPadElement.classList.add("selected");

      selectedLink = pad.link || null;

      if (selectedLink) setGoEnabled(true);
      else setGoEnabled(false);

      if (pad.sound) new Audio("sounds/" + pad.sound).play();

      display.innerHTML = `
        <h1>${artistName}</h1>
        <p>${pad.displayTitle || ""}</p>
      `;
    });

    padGrid.appendChild(padElement);
  });

  padGrid.style.gridTemplateRows = `repeat(${displayCount / 4}, 1fr)`;
}

/* =============================
GO / CANCEL
============================= */
goButton.addEventListener("click", () => {
  if (!selectedLink) return;

  window.open(selectedLink, "_blank");
  resetSelection();
});

cancelButton.addEventListener("click", () => resetSelection());

// Top copies -> forward clicks, but only when enabled
goDisplayButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    goButton.click();
  });
});

cancelDisplayButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    cancelButton.click();
  });
});

function resetSelection() {
  if (selectedPadElement) selectedPadElement.classList.remove("selected");

  selectedPadElement = null;
  selectedLink = null;

  setGoEnabled(false);
}

/* =============================
THEME
============================= */
function applyTheme(bank) {
  if (!bank.theme) return;

  const root = document.documentElement;

  if (bank.theme.primary) root.style.setProperty("--primary-color", bank.theme.primary);
  if (bank.theme.displayBg) root.style.setProperty("--display-bg", bank.theme.displayBg);

  if (bank.theme.backgroundImage) {
    root.style.setProperty(
      "--theme-image",
      `url(images/${bank.theme.backgroundImage})`
    );
  }
}
