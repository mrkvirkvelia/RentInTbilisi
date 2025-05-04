
const leadersUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=2012190272&single=true&output=csv";
const agentsUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRVA-laobSqXhVOibm1DimxHRQ79_VSyvAEdVtCA4Tkqh0emR7vtFefmZ0IhaFGYJxLwHT0RiaXvsHh/pub?gid=2070020604&single=true&output=csv";

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

Promise.all([fetchCSV(leadersUrl), fetchCSV(agentsUrl)]).then(([leadersData, agentsData]) => {
  const leaders = leadersData.flat();
  const teams = {};
  let currentLeaderIndex = 0;

  for (let i = 0; i < agentsData.length; i++) {
    const row = agentsData[i];
    if (row.length < 3) continue;
    const name = row[0];
    const lat = parseFloat(row[1]);
    const lng = parseFloat(row[2]);
    const leader = leaders[currentLeaderIndex];

    if (!teams[leader]) teams[leader] = [];
    const agent = { name, lat, lng };
    teams[leader].push(agent);

    const marker = L.marker([lat, lng]).addTo(map).bindPopup(`<b>${name}</b><br>Куратор: ${leader}`);
    markers[name] = marker;

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
        map.setView([agent.lat, agent.lng], 15);
        markers[agent.name].openPopup();
      };
      ul.appendChild(li);
    });
  });
});
