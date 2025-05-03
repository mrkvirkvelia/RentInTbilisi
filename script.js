
const teamUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=2012190272&single=true&output=csv";
const sectorsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=789608973&single=true&output=csv";

const map = L.map("map").setView([41.7151, 44.8271], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = {};
let sectors = [];

// Загрузка секторов с координатами (название и координаты — примерные)
function loadSectors(callback) {
  Papa.parse(sectorsUrl, {
    download: true,
    complete: function (results) {
      sectors = results.data.flat().filter(s => s.trim() !== "");
      callback();
    }
  });
}

// Сопоставим секторам фиктивные координаты (можно заменить на реальные)
function getSectorCoordinates(name) {
  const hash = [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const lat = 41.70 + (hash % 10) * 0.01;
  const lon = 44.80 + (hash % 10) * 0.01;
  return [lat, lon];
}

// Загрузка команд и агентов
function loadTeams() {
  Papa.parse(teamUrl, {
    download: true,
    complete: function (results) {
      const data = results.data;
      const listDiv = document.getElementById("teamList");
      listDiv.innerHTML = "";
      let currentLeader = "";
      let currentSector = "";
      data.forEach(row => {
        const [col1, col2] = row;
        if (col1 && col2 && col2.startsWith("Сектор: ")) {
          currentLeader = col1.trim();
          currentSector = col2.replace("Сектор: ", "").trim();
          const leaderDiv = document.createElement("div");
          leaderDiv.innerHTML = `<strong>${currentLeader}</strong><br/><em>${currentSector}</em>`;
          listDiv.appendChild(leaderDiv);
        } else if (col2 && currentLeader) {
          const agentName = col2.trim();
          const agentDiv = document.createElement("div");
          agentDiv.className = "agent";
          agentDiv.textContent = "- " + agentName;
          agentDiv.onclick = () => {
            const coords = getSectorCoordinates(currentSector);
            map.setView(coords, 14);
            if (markers[agentName]) {
              markers[agentName].openPopup();
            }
          };
          listDiv.appendChild(agentDiv);
          const coords = getSectorCoordinates(currentSector);
          const marker = L.marker(coords).addTo(map).bindPopup(`<b>${agentName}</b><br/>Куратор: ${currentLeader}<br/>Сектор: ${currentSector}`);
          markers[agentName] = marker;
        }
      });
    }
  });
}

loadSectors(loadTeams);
