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
  statusLed.classList.remove("active");
  goInstruction.innerHTML = 'Press a Pad then hit <strong>GO</strong> to launch';
  
  
  const menuItems = document.querySelectorAll("#displayMenu span");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    const section = item.dataset.section;

    if (section === "about") {
      display.innerHTML = `
        <h1>About</h1>
        <p>Short bio goes here.</p>
      `;
    }

    if (section === "contact") {
      display.innerHTML = `
        <h1>Contact</h1>
        <p>email@soundmandave.co.uk</p>
      `;
    }

    if (section === "services") {
      display.innerHTML = `
        <h1>Services</h1>
        <p>Production, Mixing, Mastering</p>
      `;
    }
  });
});
  
  
  document.getElementById("cancelBtn").addEventListener("click", () => {
  display.innerHTML = `
    <h1>${artistHeader.textContent}</h1>
    <p>Select Category</p>
  `;
});

document.getElementById("goBtn").addEventListener("click", () => {
  // You can later attach this to launch selected pad
  console.log("GO pressed");
});
}