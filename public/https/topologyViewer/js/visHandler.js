let TOKEN;
let VIS_CONTAINER;
let TOKEN_INPUT_WRAPPER;
let TOKEN_INPUT;
let GRAPH_WRAPPER;
let DETAIL;

let NODES_DATASET = new vis.DataSet();
let EDGES_DATASET = new vis.DataSet();
let NETWORK;
let LOCATION_DATA = {};

const optionsKey = "VISJS_NETWORK_OPTIONS_OVERRIDE";

let GROUP_COLORS = [
  colors.csBlue,
  colors.csOrange,
  colors.purple,
  colors.blue,
  colors.darkGreen,
  colors.red,
  colors.iosBlue,
  colors.lightBlue2,
  colors.blinkColor1,
  colors.csBlueLight,
  colors.darkPurple,
  colors.blue3,
  colors.darkRed,
]

function initDOM() {
  const urlParams = new URLSearchParams(window.location.search);

  TOKEN = urlParams.get('access_token');
  GRAPH_WRAPPER         = document.getElementById("networkContainer");
  TOKEN_INPUT_WRAPPER   = document.getElementById("tokenInputWrapper");
  DETAIL                = document.getElementById("detail");
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

  let customOptions = window.localStorage.getItem(optionsKey);
  if (customOptions === null) {
    customOptions = {};
  }
  else {
    try {
      customOptions = JSON.parse(customOptions);
    }
    catch (err) {
      window.localStorage.removeItem(optionsKey);
      customOptions = {};
    }
  }
  var options = {
    nodes: {
      shape: "dot",
    },
    configure: {
      filter: function (option, path) {
        if (path.indexOf("physics") !== -1) {
          return true;
        }
        if (path.indexOf("smooth") !== -1 || option === "smooth") {
          return true;
        }
        return false;
      },
      container: document.getElementById("config"),
    },
    edges: {
      smooth: {
        forceDirection: 'none'
      }
    },
    physics: {
      barnesHut: {
        gravitationalConstant: -10000,
        springLength: 130,
        springConstant: 0.02
      },
      minVelocity: 0.75
    },
  };

  vis.util.deepExtend(options, customOptions);
  NETWORK = new vis.Network(VIS_CONTAINER, {nodes: NODES_DATASET, edges: EDGES_DATASET}, options);

  NETWORK.on("click", (data) => {
    if (data.nodes.length == 0 && data.edges.length > 0) {
      // show edge
      let edgeData = EDGES_DATASET.get(data.edges[0])
      DETAIL.innerHTML = JSON.stringify({
        ...edgeData.data, lastSeen: new Date(edgeData.data.lastSeen).toLocaleTimeString()
      }, undefined, 2);
    }
    else if (data.nodes.length == 0 && data.edges.length == 0) {
      DETAIL.innerHTML = '';
    }
    else {
      // show node summary
      let nodeData = NODES_DATASET.get(data.nodes[0])
      DETAIL.innerHTML = JSON.stringify({connections: data.edges.length, ...nodeData}, undefined, 2)
    }
  })

  NETWORK.on("configChange", (options) => {
    let baseOptions = NETWORK.getOptionsFromConfigurator();
    vis.util.deepExtend(baseOptions, options);
    window.localStorage.setItem(optionsKey, JSON.stringify(baseOptions));
  })
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
  postCommand(`../api/network/refreshTopology?access_token=${TOKEN}`, (data) => {})
}


function getEdgeSettings(rssi) {
  let label = rssi;
  // item list for the 6 different phases. They fade to each other.
  let bounds = [-70, -76, -83, -92];

  let baseWidth = 10;
  if (rssi > bounds[0]) {
    // 0 .. -59
    return {offset: 0, color: colors.green.hex, width: baseWidth, label: label}
  }
  else if (rssi > bounds[1]) {
    // -60 .. -69
    let factor = 1-Math.abs((rssi - bounds[0])/(bounds[0]-bounds[1]));
    return {offset: 0, color: colors.green.blend(colors.blue2, 1-factor).hex, width: baseWidth*0.4 + baseWidth*0.6*factor, label: label}
  }
  else if (rssi > bounds[2]) {
    // -70 .. -79
    let factor = 1-Math.abs((rssi - bounds[1])/(bounds[1]-bounds[2]));
    return {offset: 0, color: colors.blue2.blend(colors.purple, 1-factor).hex, width: baseWidth*0.4*0.4 + baseWidth*0.4*0.6*factor, label: label}
  }
  else if (rssi > bounds[3]) {
    let factor = 1-Math.abs((rssi - bounds[2])/(bounds[2]-bounds[3]));
    // -81 .. -85
    return {offset: 0, color: colors.purple.blend(colors.red, 1-factor).hex, width: baseWidth*0.4*0.4, label: label}

  }
  else {
    // -95 .. -120
    return {offset: 0, color: colors.darkRed.hex, width: baseWidth*0.4*0.4, opacity: 0.6, dashArray:"8, 12", label: label}

  }
}
/**
 * Data has the form of
 *
 {
    to: number,
    from: number,
    rssi: {37: number, 38: number, 39: number},
    lastSeen: number,
 }
 * @param finishedCallback
 */
function downloadAndShowData(finishedCallback = null) {
  getData(`../api/network?access_token=${TOKEN}`, (stringifiedData) => {
    let data = JSON.parse(stringifiedData);
    let nodes = [];
    let edges = [];
    let groups = [];

    LOCATION_DATA = data.locations;

    let connectionSizeMap = {};
    let duplicateMap = {}
    for (let i = 0; i < data.edges.length; i++) {
      let edgeData = data.edges[i];
      let average  = 0;
      let avgCount = 0;
      if (edgeData.rssi['37'] !== 0) { average += edgeData.rssi['37']; avgCount += 1; }
      if (edgeData.rssi['38'] !== 0) { average += edgeData.rssi['38']; avgCount += 1; }
      if (edgeData.rssi['39'] !== 0) { average += edgeData.rssi['39']; avgCount += 1; }
      let avg = Math.round(average/avgCount);

      let id = getEdgeId(edgeData);
      // this eliminates the back-forth edges.
      if (duplicateMap[id] === undefined) {
        duplicateMap[id] = true;
        edges.push({from: edgeData.from, to: edgeData.to, ...getEdgeSettings(avg), data: edgeData});

        if (connectionSizeMap[edgeData.from] === undefined) { connectionSizeMap[edgeData.from] = 15; }
        if (connectionSizeMap[edgeData.to] === undefined)   { connectionSizeMap[edgeData.to]   = 15; }
        connectionSizeMap[edgeData.from] += 3;
        connectionSizeMap[edgeData.to]   += 3;
      }
    }

    for (let nodeId in data.nodes) {
      let node = data.nodes[nodeId];
      let locationName = node.locationCloudId;
      if (locationName && LOCATION_DATA[locationName]) {
        locationName = LOCATION_DATA[locationName].name;
      }
      if (groups.indexOf(locationName) === -1) {
        groups.push(locationName);
      }
      nodes.push({id: nodeId, label: node.name, ...node, group: locationName, size: connectionSizeMap[nodeId] || 15, shape: node.type === 'CROWNSTONE_HUB' ? 'star' : 'dot'})
    }

    NODES_DATASET.update(nodes);
    EDGES_DATASET.clear();
    EDGES_DATASET.add(edges);

    groups.sort();
    let groupObject = {};
    let index = 0;
    for (let group of groups) {
      groupObject[group] = { color: GROUP_COLORS[index++].hex }
    }
    console.log(groups, groupObject)
    NETWORK.setOptions({groups:groupObject})

    if (finishedCallback) {
      finishedCallback();
    }
  })
}

function getEdgeId(edge) {
  let ar = [edge.to, edge.from]
  ar.sort();
  return ar.join("__")
}