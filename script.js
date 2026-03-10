let selectedLink = null;
let selectedPadElement = null;

const goButton = document.getElementById("goButton");
const cancelButton = document.getElementById("cancelButton");
const statusLed = document.getElementById("statusLed");
const goInstruction = document.getElementById("goInstruction");

const padGrid = document.getElementById("padGrid");
const tabBar = document.getElementById("tabBar");
const utilityStrip = document.getElementById("utilityStrip");
const display = document.getElementById("mpcDisplay");
const terminalTitle = document.getElementById("terminalTitle");

fetch("pads.json")
  .then(res => res.json())
  .then(data => {

/*
==================================================
BUILD DISPLAY MENU FROM JSON
Supports:
- content mode (renders HTML)
- bank mode (switches pad bank)
==================================================
*/

if (data.displayMenu) {

  const displayMenu = document.getElementById("displayMenu");

  data.displayMenu.forEach(menuItem => {

    const span = document.createElement("span");
    span.textContent = menuItem.label;

    span.addEventListener("click", () => {

      // CONTENT TYPE
      if (menuItem.type === "content") {

        display.innerHTML = `
          <h1>${menuItem.title}</h1>
          ${menuItem.content}
        `;

      }

      // BANK SWITCH TYPE
    /*
==================================================
BANK SWITCH BY NAME (NOT INDEX)
==================================================
*/
if (menuItem.type === "bank") {

  const bank = data.categories.find(
    category => category.name === menuItem.bankName
  );

  if (bank) {

    buildPads(bank.pads, data.artistName);

/*
==================================================
APPLY BANK THEME
==================================================
*/

if (bank.theme) {

  const root = document.documentElement;

  if (bank.theme.primary)
    root.style.setProperty('--primary-color', bank.theme.primary);

  if (bank.theme.accent)
    root.style.setProperty('--accent-color', bank.theme.accent);

  if (bank.theme.displayBg)
    root.style.setProperty('--display-bg', bank.theme.displayBg);

  if (bank.theme.backgroundImage) {
    root.style.setProperty(
      '--theme-image',
      `url(images/${bank.theme.backgroundImage})`
    );
  }

}


    // Update active side tab visually
    document.querySelectorAll(".tab-button")
      .forEach(t => t.classList.remove("active"));

    const tabButtons = document.querySelectorAll(".tab-button");

    tabButtons.forEach(tab => {
      if (tab.textContent === bank.name) {
        tab.classList.add("active");
      }
    });

    display.innerHTML = `
      <h1>${bank.name}</h1>
      <p>Pad bank loaded.</p>
    `;
  }
  
  // If bankName exists, switch bank too
if (menuItem.bankName) {

  const bank = data.categories.find(
    category => category.name === menuItem.bankName
  );

  if (bank) {
    buildPads(bank.pads, data.artistName);
  }
}
}

    displayMenu.appendChild(span);

  });

}	

    terminalTitle.textContent = data.headerTitle || "STUDIO TERMINAL";

    display.innerHTML = `
      <h1>${data.artistName}</h1>
      <p>${data.tagline}</p>
    `;

    // Utility Buttons
    if (data.utilityButtons) {
      data.utilityButtons.forEach(btn => {
        const a = document.createElement("a");
        a.classList.add("utility-btn");
        a.textContent = btn.label;
        a.href = btn.url;
        a.target = "_blank";
        utilityStrip.appendChild(a);
      });
    }

    // Build Banks / Categories
    data.categories.forEach((category, index) => {

      const tab = document.createElement("button");
      tab.classList.add("tab-button");
      tab.textContent = category.name;

      if (index === 0) tab.classList.add("active");

      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab-button")
          .forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        buildPads(category.pads, data.artistName);
      });

      tabBar.appendChild(tab);
    });

    buildPads(data.categories[0].pads, data.artistName);
  });

function buildPads(pads, artistName) {

  padGrid.innerHTML = "";

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

    // ✅ Thumbnail support
    if (pad.thumbnail) {
      const img = document.createElement("img");
      img.src = "images/" + pad.thumbnail;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.position = "absolute";
      img.style.top = 0;
      img.style.left = 0;
      padElement.appendChild(img);
    }

    // ✅ Label
    const label = document.createElement("div");
    label.classList.add("pad-label");
    label.textContent = pad.padLabel || `PAD ${index+1}`;
    padElement.appendChild(label);

    padElement.addEventListener("click", () => {

      if (selectedPadElement) {
        selectedPadElement.classList.remove("selected");
      }

      selectedPadElement = padElement;
      selectedPadElement.classList.add("selected");

      selectedLink = pad.link || null;

      if (selectedLink) {
        goButton.disabled = false;
        statusLed.classList.add("active");
        goInstruction.textContent = "Ready. Press GO to launch.";
      }

      // ✅ Sound support
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

  padGrid.style.gridTemplateRows = `repeat(${displayCount/4}, 1fr)`;
}

//Other//Additions

goButton.addEventListener("click", () => {
/*
==================================================
DISPLAY TRANSPORT BUTTON HOOKS
These reuse existing logic
==================================================
*/

const goDisplayButtons = document.querySelectorAll(".go-display");
const cancelDisplayButtons = document.querySelectorAll(".cancel-display");

// Mirror GO state to display button
function syncGoButtons() {
  goDisplayButtons.forEach(btn => {
    btn.disabled = goButton.disabled;
  });
}

// When main GO changes state, sync display copy
const observer = new MutationObserver(syncGoButtons);
observer.observe(goButton, { attributes: true });

// GO (display copy)
goDisplayButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    goButton.click(); // trigger original logic
  });
});

// CANCEL (display copy)
cancelDisplayButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    cancelButton.click(); // trigger original reset logic
  });
});
  if (selectedLink) {
    window.open(selectedLink, "_blank");
    resetSelection();
  }
});

cancelButton.addEventListener("click", resetSelection);

function resetSelection() {
  if (selectedPadElement) {
    selectedPadElement.classList.remove("selected");
  }
  selectedPadElement = null;
  selectedLink = null;
  goButton.disabled = true;
  syncGoButtons();
  statusLed.classList.remove("active");
  goInstruction.innerHTML = 'Press a Pad then hit <strong>GO</strong> to launch';
  
  
  

    if (section === "about") {
      display.innerHTML = `
        <h1>About</h1>
        <p>Short bio goes here.</p>
      `;
    }


    if (section === "services") {
      display.innerHTML = `
        <h1>Services</h1>
        <p>Production, Mixing, Mastering</p>
      `;
    }
    
      if (section === "contact") {
      display.innerHTML = `
        <h1>Contact</h1>
        <p>email@soundmandave.co.uk</p>
      `;
    }
  });
});
  
  
 