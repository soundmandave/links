/*
==================================================
STUDIO TERMINAL ENGINE (STABLE VERSION)
JSON‑Driven
==================================================
*/

let selectedLink = null;
let selectedPadElement = null;
let currentData = null; // store JSON globally

// Core Elements
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

// Display transport copies
const goDisplayButtons = document.querySelectorAll(".go-display");
const cancelDisplayButtons = document.querySelectorAll(".cancel-display");

/*
==================================================
LOAD JSON
==================================================
*/
fetch("pads.json")
  .then(res => res.json())
  .then(data => {

    currentData = data;

    terminalTitle.textContent =
      data.headerTitle || "STUDIO TERMINAL";

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
    console.error("JSON Load Error:", err);
  });

/*
==================================================
DISPLAY MENU
==================================================
*/
function buildDisplayMenu(data) {

  if (!data.displayMenu) return;

  data.displayMenu.forEach(menuItem => {

    const span = document.createElement("span");
    span.textContent = menuItem.label;

    span.addEventListener("click", () => {

      // Render content if present
      if (menuItem.type === "content") {
        display.innerHTML = `
          <h1>${menuItem.title}</h1>
          ${menuItem.content}
        `;
      }

      // Switch bank if defined
      if (menuItem.bankName) {
        const bank = data.categories.find(
          cat => cat.name === menuItem.bankName
        );

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

/*
==================================================
UTILITY BUTTONS
==================================================
*/
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

/*
==================================================
BANK TABS
==================================================
*/
function buildTabs(data) {

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
  document.querySelectorAll(".tab-button")
    .forEach(t => {
      t.classList.toggle("active", t.textContent === name);
    });
}

/*
==================================================
BUILD PADS
==================================================
*/
function buildPads(pads, artistName) {

  padGrid.innerHTML = "";
  resetSelection();

  const count = pads.length;

  let displayCount;
  if (count <= 8) displayCount = 8;
  else if (count <= 12) displayCount = 12;
  else displayCount = 16;

  const padded = [...pads];
  while (padded.length < displayCount) {
    padded.push({});
  }

  padded.forEach((pad, index) => {

    const padElement = document.createElement("div");
    padElement.classList.add("pad");

    // Thumbnail
    if (pad.thumbnail) {
      const img = document.createElement("img");
      img.src = "images/" + pad.thumbnail;
      img.style.position = "absolute";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      padElement.appendChild(img);
    }

    // Label
    const label = document.createElement("div");
    label.classList.add("pad-label");
    label.textContent =
      pad.padLabel || `PAD ${index + 1}`;
    padElement.appendChild(label);

    padElement.addEventListener("click", () => {

      if (selectedPadElement)
        selectedPadElement.classList.remove("selected");

      selectedPadElement = padElement;
      selectedPadElement.classList.add("selected");

      selectedLink = pad.link || null;

      if (selectedLink) {
        enableGo();
      }

      if (pad.sound) {
        new Audio("sounds/" + pad.sound).play();
      }

      display.innerHTML = `
        <h1>${artistName}</h1>
        <p>${pad.displayTitle || ""}</p>
      `;

    });

    padGrid.appendChild(padElement);

  });

  padGrid.style.gridTemplateRows =
    `repeat(${displayCount / 4}, 1fr)`;
}

/*
==================================================
GO / CANCEL
==================================================
*/

goButton.addEventListener("click", () => {
  if (selectedLink) {
    window.open(selectedLink, "_blank");
    resetSelection();
  }
});

cancelButton.addEventListener("click", resetSelection);

// Display transport copies
goDisplayButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    goButton.click();
  });
});

cancelDisplayButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    cancelButton.click();
  });
});

function enableGo() {
  goButton.disabled = false;
  statusLed.classList.add("active");
  goInstruction.textContent =
    "Ready. Press GO to launch.";

  goDisplayButtons.forEach(btn => {
    btn.disabled = false;
  });
}

function resetSelection() {

  if (selectedPadElement) {
    selectedPadElement.classList.remove("selected");
  }

  selectedPadElement = null;
  selectedLink = null;

  goButton.disabled = true;
  goDisplayButtons.forEach(btn => {
    btn.disabled = true;
  });

  statusLed.classList.remove("active");

  goInstruction.innerHTML =
    'Press a Pad then hit <strong>GO</strong> to launch';
}

/*
==================================================
THEME SYSTEM
==================================================
*/
function applyTheme(bank) {

  if (!bank.theme) return;

  const root = document.documentElement;

  if (bank.theme.primary)
    root.style.setProperty(
      "--primary-color",
      bank.theme.primary
    );

  if (bank.theme.displayBg)
    root.style.setProperty(
      "--display-bg",
      bank.theme.displayBg
    );

  if (bank.theme.backgroundImage)
    root.style.setProperty(
      "--theme-image",
      `url(images/${bank.theme.backgroundImage})`
    );
}
