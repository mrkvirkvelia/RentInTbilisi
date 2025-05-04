const agentsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVA-laobSqXhVOibm1DimxHRQ79_VSyvAEdVtCA4Tkqh0emR7vtFefmZ0IhaFGYJxLwHT0RiaXvsHh/pub?gid=2070020604&single=true&output=csv';
const leadersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=2012190272&single=true&output=csv';

const districts = ['Vake', 'Saburtalo', 'Didube', 'Chugureti', 'Gldani', 'Isani', 'Mtatsminda', 'Vera'];

const districtCenters = {
  Vake: [41.7096, 44.7778],
  Saburtalo: [41.7265, 44.7501],
  Didube: [41.7414, 44.7933],
  Chugureti: [41.7163, 44.8011],
  Gldani: [41.7997, 44.8224],
  Isani: [41.7161, 44.8504],
  Mtatsminda: [41.6935, 44.8007],
  Vera: [41.7071, 44.7880]
};

let map;
let markers = {};

async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.trim().split('\n').slice(1);
  return rows.map(row => row.trim()).filter(name => name);
}

function assignAgentsToDistricts(agents, leaders) {
  const assignments = {};
  const shuffled = agents.sort(() => Math.random() - 0.5);
  let index = 0;
  for (const district of districts) {
    assignments[district] = [];
    for (let i = 0; i < 2 && index < shuffled.length; i++) {
      assignments[district].push(shuffled[index++]);
    }
  }
  return assignments;
}

function displayAgentList(assignments, leaders) {
  const list = document.getElementById('agent-list');
  list.innerHTML = '';
  for (const district of districts) {
    const agents = assignments[district] || [];
    agents.forEach(agent => {
      const li = document.createElement('li');
      li.textContent = `${agent} (${district})`;
      if (leaders.includes(agent)) {
        li.classList.add('leader');
      }
      li.addEventListener('click', () => {
        const marker = markers[agent];
        if (marker) {
          marker.openPopup();
          map.setView(marker.getLatLng(), 13);
        }
      });
      list.appendChild(li);
    });
  }
}

function initMap(assignments, leaders) {
  map = L.map('map').setView([41.7151, 44.8271], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  for (const district of districts) {
    const agents = assignments[district] || [];
    const center = districtCenters[district];
    agents.forEach(agent => {
      const isLeader = leaders.includes(agent);
      const marker = L.marker(center).addTo(map);
      marker.bindPopup(`<strong>${agent}</strong><br>${district}${isLeader ? '<br><em>Лидер команды</em>' : ''}`);
      markers[agent] = marker;
    });
  }
}

async function main() {
  const [agents, leaders] = await Promise.all([
    fetchCSV(agentsCsvUrl),
    fetchCSV(leadersCsvUrl)
  ]);
  const assignments = assignAgentsToDistricts(agents, leaders);
  displayAgentList(assignments, leaders);
  initMap(assignments, leaders);
}

main();