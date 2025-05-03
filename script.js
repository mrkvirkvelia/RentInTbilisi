
const map = L.map('map').setView([41.7151, 44.8271], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnniV_4zdbgaGHY31VrdvsQhF6u3-bMlDaovj27uuyhAmAYFalAbe_-d5ZPdND1L2KovQMH_bfJz-i/pub?gid=1302622492&single=true&output=csv';

fetch(CSV_URL)
  .then(response => response.text())
  .then(csv => {
    const lines = csv.split('\n').slice(1);
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';

    const teams = {};
    lines.forEach(line => {
      const [agent, curator, area, lat, lng] = line.split(',');
      if (!agent || !lat || !lng) return;
      if (!teams[curator]) teams[curator] = [];
      const marker = L.marker([parseFloat(lat), parseFloat(lng)])
        .addTo(map)
        .bindPopup(`<b>${agent}</b><br>${area}`);
      teams[curator].push({ agent, area, marker });
    });

    for (const curator in teams) {
      const curatorDiv = document.createElement('div');
      curatorDiv.className = 'curator';
      curatorDiv.textContent = curator;
      sidebar.appendChild(curatorDiv);

      teams[curator].forEach(({ agent, area, marker }) => {
        const agentDiv = document.createElement('div');
        agentDiv.className = 'agent';
        agentDiv.textContent = `• ${agent} (${area})`;
        agentDiv.onclick = () => {
          map.setView(marker.getLatLng(), 14);
          marker.openPopup();
        };
        sidebar.appendChild(agentDiv);
      });
    }
  });
