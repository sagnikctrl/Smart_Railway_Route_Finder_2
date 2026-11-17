let graph = null;

async function loadData() {
  const stationsResponse = await fetch("data/stations.json");
  const connectionsResponse = await fetch("data/connections.json");
  const stations = await stationsResponse.json();
  const connections = await connectionsResponse.json();
  return buildGraph(stations, connections);
}

function fillDropdown(selectId) {
  const select = document.getElementById(selectId);
  for (const id in graph) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = graph[id].name;
    select.appendChild(option);
  }
}

// Makes one result box: a title, a summary line, and a numbered list of stations.
function makeResultBox(title, summaryText, path) {
  const box = document.createElement("div");
  box.className = "result-box";

  const h3 = document.createElement("h3");
  h3.textContent = title;
  box.appendChild(h3);

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = summaryText;
  box.appendChild(summary);

  const list = document.createElement("ol");
  path.forEach(function (id) {
    const li = document.createElement("li");
    li.textContent = graph[id].name;
    list.appendChild(li);
  });
  box.appendChild(list);

  return box;
}

function showMessage(text) {
  const out = document.getElementById("routeOutput");
  out.innerHTML = "";
  const p = document.createElement("p");
  p.className = "message";
  p.textContent = text;
  out.appendChild(p);
}

function findRoute() {
  const start = document.getElementById("startSelect").value;
  const end = document.getElementById("endSelect").value;

  if (start === end) {
    showMessage("Please choose two different stations.");
    return;
  }

  const bfsPath = bfs(graph, start, end);
  const dj = dijkstra(graph, start, end);

  if (!bfsPath || !dj) {
    showMessage("No route found between these stations.");
    return;
  }

  const out = document.getElementById("routeOutput");
  out.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "result-grid";
  grid.appendChild(makeResultBox(
    "BFS: fewest stops",
    (bfsPath.length - 1) + " hops",
    bfsPath
  ));
  grid.appendChild(makeResultBox(
    "Dijkstra: shortest distance",
    dj.distance + " km",
    dj.path
  ));
  out.appendChild(grid);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = "Distances come from unverified data (third-party timetables).";
  out.appendChild(note);
}

loadData()
  .then(function (g) {
    graph = g;
    fillDropdown("startSelect");
    fillDropdown("endSelect");
    document.getElementById("findBtn").addEventListener("click", findRoute);

    let text = "";
    for (const id in graph) {
      const names = graph[id].neighbors.map(function (n) {
        return graph[n.to].name + " (" + n.distance + " km)";
      });
      text += graph[id].name + ": " + (names.length ? names.join(", ") : "no connections yet") + "\n";
    }
    document.getElementById("graphOutput").textContent = text;
  })
  .catch(function (error) {
    document.getElementById("graphOutput").textContent = "Error: " + error;
  });