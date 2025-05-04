const leadersUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=2012190272&single=true&output=csv";
const agentsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=1302622492&single=true&output=csv";
const sectorsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=789608973&single=true&output=csv";

let map = L.map("map").setView([41.7151, 44.8271], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = {};

function parseCSV(text) {
  return text.trim().split("\n").map(line => line.split(","));
}

function fetchCSV(url) {
  return fetch(url).then(res => res.text()).then(parseCSV);
}

Promise.all([fetchCSV(leadersUrl), fetchCSV(agentsUrl), fetchCSV(sectorsUrl)]).then(([leadersData, agentsData, sectorsData]) => {
  const leaders = leadersData.flat();
  const sectors = {};
  sectorsData.forEach(row => {
    const [sector, lat, lng] = row;
    sectors[sector] = { lat: parseFloat(lat), lng: parseFloat(lng) };
  });

  const teams = {};
  let currentLeaderIndex = 0;

  for (let i = 0; i < agentsData.length; i++) {
    const row = agentsData[i];
    if (row.length < 2) continue;
    const name = row[0];
    const sector = row[1];
    const leader = leaders[currentLeaderIndex];

    if (!teams[leader]) teams[leader] = [];
    const agent = { name, sector };
    teams[leader].push(agent);

    const sectorCoords = sectors[sector];
    if (sectorCoords) {
      const marker = L.marker([sectorCoords.lat, sectorCoords.lng]).addTo(map).bindPopup(`<b>${name}</b><br>Куратор: ${leader}`);
      markers[name] = marker;
    }

    currentLeaderIndex = (currentLeaderIndex + 1) % leaders.length;
  }

  const ul = document.getElementById("team-list");
  Object.entries(teams).forEach(([leader, agents]) => {
    const liLeader = document.createElement("li");
    liLeader.innerHTML = `<b>${leader}</b>`;
    ul.appendChild(liLeader);

    agents.forEach(agent => {
      const li = document.createElement("li");
      li.textContent = agent.name;
      li.onclick = () => {
        const marker = markers[agent.name];
        if (marker) {
          map.setView(marker.getLatLng(), 15);
          marker.openPopup();
        } else {
          alert("Координаты сектора не найдены.");
        }
      };
      ul.appendChild(li);
    });
  });
});
