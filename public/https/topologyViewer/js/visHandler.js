let TOKEN;
let VIS_CONTAINER;
let TOKEN_INPUT_WRAPPER;
let TOKEN_INPUT;
let GRAPH_WRAPPER;

let NODES_DATASET = new vis.DataSet();
let EDGES_DATASET = new vis.DataSet();
let NETWORK;



function initDOM() {
  const urlParams = new URLSearchParams(window.location.search);

  TOKEN = urlParams.get('access_token');
  GRAPH_WRAPPER         = document.getElementById("networkContainer");
  TOKEN_INPUT_WRAPPER   = document.getElementById("tokenInputWrapper");
  TOKEN_INPUT           = document.getElementById("tokenInput");
  VIS_CONTAINER         = document.getElementById("meshTopology")
  if (TOKEN) {
    TOKEN_INPUT_WRAPPER.style.display = 'none';
    GRAPH_WRAPPER.style.display = 'block';
    initVis();
    getTopology();
  }
}

function initVis() {
  // create a dataSet with groups

  var options = {

  };
  NETWORK = new vis.Network(VIS_CONTAINER, {nodes: NODES_DATASET, edges: EDGES_DATASET}, options);

  getMockData()
}

function refreshData() {
  refreshTopology(() => {
    drawData();
  })
}

function getTopology() {
  downloadAndShowData()
}


function refreshTopology() {
  postCommand(`../api/mesh/refreshTopology?access_token=${TOKEN}`, (data) => {})
}

function getMockData() {
  let nodes = [
    { id: 1, value: 2, label: "Algie" },
    { id: 2, value: 31, label: "Alston" },
    { id: 3, value: 12, label: "Barney" },
    { id: 4, value: 16, label: "Coley" },
    { id: 5, value: 17, label: "Grant" },
    { id: 6, value: 15, label: "Langdon" },
    { id: 7, value: 6, label: "Lee" },
    { id: 8, value: 5, label: "Merlin" },
    { id: 9, value: 30, label: "Mick" },
    { id: 10, value: 18, label: "Tod" },
  ];

  // create connections between people
  // value corresponds with the amount of contact between two people
  let edges = [
    { from: 2, to: 8, value: 3 },
    { from: 2, to: 9, value: 5 },
    { from: 2, to: 10, value: 1 },
    { from: 4, to: 6, value: 8 },
    { from: 5, to: 7, value: 2 },
    { from: 4, to: 5, value: 1 },
    { from: 9, to: 10, value: 2 },
    { from: 2, to: 3, value: 6 },
    { from: 3, to: 9, value: 4 },
    { from: 5, to: 3, value: 1 },
    { from: 2, to: 7, value: 4 },
  ];

  NODES_DATASET.clear();
  EDGES_DATASET.clear();
  NODES_DATASET.add(nodes);
  EDGES_DATASET.add(edges);
}

/**
 * Data has the form of
 *
 {
    to: number,
    from: number,
    rssi: {37: number, 38: number, 39: number},
    lastSeen: number,
    history: {
     rssi: {37: number, 38: number, 39: number},
     lastSeen: number
    }
 }
 * @param finishedCallback
 */
function downloadAndShowData(finishedCallback = null) {
  getData(`../api/mesh/network?access_token=${TOKEN}`, (data) => {
    console.log(data)
    let rawData = JSON.parse(data);
    let nodes = [];
    let nodesMap = {};

    let edges = [];

    function addNode(nodeId) {
      if (!nodesMap[nodeId]) {
        nodesMap[nodeId] = true;
        nodes.push({id: nodeId})
      }
    }
    function addEdge(d) {
      edges.push({from: d.from, to: d.to, data: d})
    }

    for (let i = 0; i < rawData.length; i++) {
      let d = rawData[i];
      addNode(d.to)
      addNode(d.from)
      addEdge(d)
    }

    NODES_DATASET.update(nodes);
    EDGES_DATASET.clear();
    EDGES_DATASET.add(edges);


    if (finishedCallback) {
      finishedCallback();
    }
  })
}
