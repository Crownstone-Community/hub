



let DATASET = new vis.DataSet();
let GRAPH_2D;

function initVis() {
  // create a dataSet with groups
  var groups = new vis.DataSet();
  groups.add({id: 'power',  content: "power" , className:'powerUsageGraphStyle'})
  groups.add({id: 'energy', content: "energy", className:'energyUsageGraphStyle'})

  var options = {
    interpolation: false,
    sampling: true,
    shaded: {
      orientation: 'bottom'
    },
    dataAxis: {
      left: {
        range: {
          min:0
        }
      }
    }
  };
  GRAPH_2D = new vis.Graph2d(VIS_CONTAINER, DATASET, groups, options);
}


let DATA = null;

function selectedStoneChanged() {
  downloadData(() => {
    drawData();
  })
}

function downloadData(finishedCallback = null) {
  let fromTime = new Date(FROM_DATE.value + " " + FROM_TIME.value).toISOString();
  let untilTime = new Date(UNTIL_DATE.value + " " + UNTIL_TIME.value).toISOString();
  getData(`../api/energyRange?crownstoneUID=${STONE_SELECT_DROPDOWN.value}&from=${fromTime}&until=${untilTime}&limit=${SAMPLE_COUNT.value}&access_token=${TOKEN}`, (data) => {
    DATA = JSON.parse(data);
    if (finishedCallback) {
      finishedCallback();
    }
  })
}

function drawData() {
  DATASET.clear();
  if (!DATA) { return; }

  if (USE_DATA_TYPE === "E") {
    drawEnergyData();
  }
  else {
    drawPowerData();
  }
  GRAPH_2D.fit();
}

function drawPowerData() {
  let datasetFormat = [];
  GRAPH_2D.setOptions({interpolation:true})
  if (POWER_PRESENTATION === 'MINUTE') {
    for (let i = 1; i < DATA.length; i++) {
      let dE = (DATA[i].energyUsage - DATA[i-1].energyUsage)/60;
      let t = (new Date(DATA[i-1].timestamp).valueOf() + new Date(DATA[i].timestamp).valueOf()) / 2;
      datasetFormat.push({x: t, y: dE, group: 'power' });
    }
  }
  DATASET.add(datasetFormat);
}

function drawEnergyData() {
  GRAPH_2D.setOptions({interpolation:false})
  let factor = 1;
  if (ENERGY_UNITS === 'Wh') {
    factor = 1/3600;
  }
  else if (ENERGY_UNITS === 'kWh') {
    factor = 1/3600000;
  }

  let initialValue = 0;
  if (DATA.length > 0) {
    initialValue = DATA[0].energyUsage*factor;
  }

  let datasetFormat = [];
  if (ENERGY_PRESENTATION === 'CUMULATIVE') {
    for (let i = 0; i < DATA.length; i++) {
      datasetFormat.push({x:DATA[i].timestamp, y: factor*DATA[i].energyUsage - initialValue, group: "energy" });
    }
  }
  else if (ENERGY_PRESENTATION === 'MINUTE') {
    for (let i = 1; i < DATA.length; i++) {
      let t = (new Date(DATA[i-1].timestamp).valueOf() + new Date(DATA[i].timestamp).valueOf()) / 2;
      let dE = factor*(DATA[i].energyUsage - DATA[i-1].energyUsage);
      datasetFormat.push({x: t, y: dE, group: "energy" });
    }
  }
  DATASET.add(datasetFormat);
}
