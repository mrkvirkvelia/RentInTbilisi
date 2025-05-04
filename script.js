const agentsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVA-laobSqXhVOibm1DimxHRQ79_VSyvAEdVtCA4Tkqh0emR7vtFefmZ0IhaFGYJxLwHT0RiaXvsHh/pub?gid=2070020604&single=true&output=csv';

const districts = ['Vake', 'Saburtalo', 'Didube', 'Chugureti', 'Gldani', 'Isani', 'Mtatsminda', 'Vera'];

async function loadAgents() {
  const response = await fetch(agentsCsvUrl);
  const text = await response.text();
  const rows = text.trim().split('\n').slice(1);
  return rows.map(row => row.trim()).filter(name => name);
}

function assignAgentsToDistricts(agents) {
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

function displayAgentList(assignments) {
  const list = document.getElementById('agent-list');
  list.innerHTML = '';
  for (const district of districts) {
    const li = document.createElement('li');
    const agents = assignments[district] || [];
    li.innerHTML = `<strong>${district}:</strong> ${agents.join(', ')}`;
    list.appendChild(li);
  }
}

function initMap(assignments) {
  const map = L.map('map').setView([41.7151, 44.8271], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

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

  for (const district of districts) {
    const agents = assignments[district] || [];
    if (districtCenters[district]) {
      const marker = L.marker(districtCenters[district]).addTo(map);
      marker.bindPopup(`<strong>${district}</strong><br>${agents.join('<br>')}`);
    }
  }
}

async function main() {
  const agents = await loadAgents();
  const assignments = assignAgentsToDistricts(agents);
  displayAgentList(assignments);
  initMap(assignments);
}

main();
