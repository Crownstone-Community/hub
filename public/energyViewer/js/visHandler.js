

let DATASET;
let GRAPH_2D;

function initVis() {
  DATASET = new vis.DataSet();
  let groups = new vis.DataSet();
  groups.add({id:'raw', content:"raw"})
  groups.add({id:'processed', content:"processed"})
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
    legend: true
  };
  GRAPH_2D = new vis.Graph2d(VIS_CONTAINER, DATASET, options);
}



function updateSelectedStoneData() {
  DATASET.clear();
  getData(`../api/energyRange?crownstoneUID=${STONE_SELECT_DROPDOWN.value}&limit=5000&access_token=${TOKEN}`, (data) => {
    let dataArr = JSON.parse(data);
    let datasetFormat = [];


    let initialValue = 0;
    if (dataArr.length > 0) {
      initialValue = dataArr[0].energyUsage;
    }
    for (let i = 0; i < dataArr.length; i++) {
      datasetFormat.push({x:dataArr[i].timestamp, y: dataArr[i].energyUsage - initialValue, group:'procressed' });
    }
    DATASET.add(datasetFormat);

    getData(`../api/rawEnergyRange?crownstoneUID=${STONE_SELECT_DROPDOWN.value}&limit=5000&access_token=${TOKEN}`, (data) => {
      let dataArr = JSON.parse(data);
      let datasetFormat = [];


      let initialValue = 0;
      if (dataArr.length > 0) {
        initialValue = dataArr[0].energyUsage;
      }
      for (let i = 0; i < dataArr.length; i++) {
        datasetFormat.push({x:dataArr[i].timestamp, y: dataArr[i].energyUsage - initialValue, group:'raw' });
      }
      DATASET.add(datasetFormat);
      GRAPH_2D.fit();
    })
  })

}