



let DATASET = new vis.DataSet();
let GRAPH_2D;

function initVis() {
  // create a dataSet with groups
  var groups = new vis.DataSet();
  groups.add({id: 'power',  content: "power" , className:'powerUsageGraphStyle'})
  groups.add({id: 'energy', content: "energy", className:'energyUsageGraphStyle'})
  groups.add({id: 'raw_energyUsage', content: "raw_energyUsage", className:'rawEnergyUsageGraphStyle'})
  groups.add({id: 'raw_correctedEnergyUsage', content: "raw_correctedEnergyUsage", className:'rawCorrectedEnergyUsageGraphStyle'})

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
    },
    legend: true
  };
  GRAPH_2D = new vis.Graph2d(VIS_CONTAINER, DATASET, groups, options);
}


let DATA = null;

function setSampling() {
  let value = SAMPLING_CHECKBOX.checked;
  GRAPH_2D.setOptions({sampling: value});
}

function selectedStoneChanged() {
  downloadData(() => {
    drawData();
  })
}

function refreshData() {
  downloadData(() => {
    drawData();
  })
}

function downloadData(finishedCallback = null) {
  let fromTime = new Date(FROM_DATE.value + " " + FROM_TIME.value).toISOString();
  let untilTime = new Date(UNTIL_DATE.value + " " + UNTIL_TIME.value).toISOString();

  if (DATA_SOURCE === 'PROCESSED') {
    getData(`../api/energyRange?crownstoneUID=${STONE_SELECT_DROPDOWN.value}&from=${fromTime}&until=${untilTime}&limit=${SAMPLE_COUNT.value}&interval=${TIME_STEP}&access_token=${TOKEN}`, (data) => {
      DATA = JSON.parse(data);
      if (finishedCallback) {
        finishedCallback();
      }
    });
  }
  else {
    getData(`../api/rawEnergyRange?crownstoneUID=${STONE_SELECT_DROPDOWN.value}&from=${fromTime}&until=${untilTime}&limit=${SAMPLE_COUNT.value}&access_token=${TOKEN}`, (data) => {
      DATA = [];
      let rawData = JSON.parse(data);
      for (let i = 0; i < rawData.length; i++) {
        let d = rawData[i];
        if (DATA_SOURCE === "RAW") {
          DATA.push({timestamp: d.timestamp, energyUsage: d.energyUsage, group: 'raw_energyUsage'})
        }
        if (DATA_SOURCE === "RAW_CORRECTED") {
          DATA.push({timestamp: d.timestamp, energyUsage: d.correctedEnergyUsage, group: 'raw_correctedEnergyUsage'})
        }
      }
      if (finishedCallback) {
        finishedCallback();
      }
    })
  }
}

function drawData() {
  DATASET.clear();
  for (let i = 1; i < DATA.length; i++) {
    let dt = new Date(DATA[i].timestamp).valueOf() - new Date(DATA[i - 1].timestamp).valueOf();
    let dE = (DATA[i].energyUsage - DATA[i - 1].energyUsage) / dt;
    datasetFormat.push({x: new Date(DATA[i - 1].timestamp).valueOf() + 1, y: dE, group: 'power'});
    datasetFormat.push({x: new Date(DATA[i].timestamp).valueOf(),     y: dE, group: 'power'});
  }
  DATASET.add(datasetFormat);
  GRAPH_2D.fit();
}

function drawPowerData() {
  let datasetFormat = [];

  if (POWER_PRESENTATION === 'AVERAGE') {
    for (let i = 1; i < DATA.length; i++) {
      let dt = new Date(DATA[i].timestamp).valueOf() - new Date(DATA[i - 1].timestamp).valueOf();
      let dE = (DATA[i].energyUsage - DATA[i - 1].energyUsage) / dt;
      let t = (new Date(DATA[i - 1].timestamp).valueOf() + new Date(DATA[i].timestamp).valueOf()) / 2;
      datasetFormat.push({x: t, y: dE, group: 'power'});
    }
  }
  else {
    for (let i = 1; i < DATA.length; i++) {
      let dt = new Date(DATA[i].timestamp).valueOf() - new Date(DATA[i - 1].timestamp).valueOf();
      let dE = (DATA[i].energyUsage - DATA[i - 1].energyUsage) / dt;
      datasetFormat.push({x: new Date(DATA[i - 1].timestamp).valueOf() + 1, y: dE, group: 'power'});
      datasetFormat.push({x: new Date(DATA[i].timestamp).valueOf(),     y: dE, group: 'power'});
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

  console.log("Correction Value:", initialValue)
  let datasetFormat = [];
  if (ENERGY_PRESENTATION === 'CUMULATIVE') {
    for (let i = 0; i < DATA.length; i++) {
      datasetFormat.push({x:DATA[i].timestamp, y: DATA[i].y || (factor*DATA[i].energyUsage - initialValue), group: DATA[i].group || "energy" });
    }
  }
  else {
    for (let i = 1; i < DATA.length; i++) {
      let t = (new Date(DATA[i-1].timestamp).valueOf() + new Date(DATA[i].timestamp).valueOf()) / 2;
      let dE = factor*(DATA[i].energyUsage - DATA[i-1].energyUsage);
      datasetFormat.push({x: t, y: dE, group: "energy" });
    }
  }
  DATASET.add(datasetFormat);
}
