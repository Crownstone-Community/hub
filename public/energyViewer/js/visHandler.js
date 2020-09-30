

let DATASET = new vis.DataSet();;
let GRAPH_2D;

function initVis() {
  // create a dataSet with groups
  var options = {
    interpolation: false,
    dataAxis: {
      right: {
        title: {
          text: 'Title (right axis)'
        }
      }
    },
  };
  GRAPH_2D = new vis.Graph2d(VIS_CONTAINER, DATASET, options);
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
  if (POWER_PRESENTATION === 'HOUR') {
    for (let i = 0; i < DATA.length; i++) {
      datasetFormat.push({x:DATA[i].timestamp, y: factor*DATA[i].energyUsage - initialValue });
    }
  }
  else if (POWER_PRESENTATION === 'MINUTE') {
    for (let i = 1; i < DATA.length; i++) {
      let dE = (DATA[i].energyUsage - DATA[i-1].energyUsage)/60;
      datasetFormat.push({x: new Date(DATA[i-1].timestamp), y: dE });
      datasetFormat.push({x: new Date(DATA[i].timestamp),   y: dE });
    }
  }
  DATASET.add(datasetFormat);
}

function drawEnergyData() {
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
      datasetFormat.push({x:DATA[i].timestamp, y: factor*DATA[i].energyUsage });
    }
  }
  else if (ENERGY_PRESENTATION === 'MINUTE') {
    for (let i = 1; i < DATA.length; i++) {
      let t = (new Date(DATA[i-1].timestamp).valueOf() + new Date(DATA[i].timestamp).valueOf()) / 2;
      let dE = factor*(DATA[i].energyUsage - DATA[i-1].energyUsage);
      datasetFormat.push({x: t, y: dE });
    }
  }
  DATASET.add(datasetFormat);

}










function debug_updateSelectedStoneData() {
  DATASET.clear();
  let fromTime = new Date(FROM_DATE.value + " " + FROM_TIME.value).toISOString();
  let untilTime = new Date(UNTIL_DATE.value + " " + UNTIL_TIME.value).toISOString();
  getData(`../api/energyRange?crownstoneUID=${STONE_SELECT_DROPDOWN.value}&from=${fromTime}&until=${untilTime}&limit=${SAMPLE_COUNT.value}&access_token=${TOKEN}`, (data) => {
    let dataArr = JSON.parse(data);
    let datasetFormat = [];


    let initialValue = 0;
    if (dataArr.length > 0) {
      initialValue = dataArr[0].energyUsage;
    }
    for (let i = 0; i < dataArr.length; i++) {
      datasetFormat.push({x:dataArr[i].timestamp, y: dataArr[i].energyUsage, group:'procressed' });
    }
    DATASET.add(datasetFormat);

    getData(`../api/rawEnergyRange?crownstoneUID=${STONE_SELECT_DROPDOWN.value}&from=${fromTime}&until=${untilTime}&limit=${SAMPLE_COUNT.value}&access_token=${TOKEN}`, (data) => {
      let dataArr = JSON.parse(data);
      let datasetFormat = [];


      let initialValue = 0;
      if (dataArr.length > 0) {
        initialValue = dataArr[0].energyUsage;
      }
      for (let i = 0; i < dataArr.length; i++) {
        datasetFormat.push({x:dataArr[i].timestamp, y: dataArr[i].energyUsage, group:'raw' });
      }
      DATASET.add(datasetFormat);
      GRAPH_2D.fit();
    })
  })
}