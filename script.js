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

  if (enabled) {
    goInstruction.textContent = "Ready. Press GO to launch.";
  } else {
    goInstruction.textContent = "Press a Pad then hit GO to launch";
  }

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
  <h1>${data.landingTitle || data.artistName}</h1>
  <p>${data.landingContent || data.tagline || ""}</p>
`;


    buildDisplayMenu(data);
    buildUtilityButtons(data);
    buildTabs(data);

    if (data.categories && data.categories.length > 0) {
      buildPads(data.categories[0].pads, data.artistName);
      applyTheme(data.categories[0]);
