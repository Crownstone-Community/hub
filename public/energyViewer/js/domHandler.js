let VIS_CONTAINER;
let STONE_SELECT_DROPDOWN;
let TOKEN;
let GRAPH_WRAPPER;
let TOKEN_INPUT_WRAPPER;
let TOKEN_INPUT;

function initDOM() {
  STONE_SELECT_DROPDOWN = document.getElementById("stoneSelector");
  GRAPH_WRAPPER = document.getElementById("graphWrapper");
  TOKEN_INPUT_WRAPPER = document.getElementById("tokenInputWrapper");
  TOKEN_INPUT = document.getElementById("tokenInput");

  const urlParams = new URLSearchParams(window.location.search);
  TOKEN = urlParams.get('access_token');

  VIS_CONTAINER = document.getElementById("visualization")

  if (TOKEN) {
    TOKEN_INPUT_WRAPPER.style.display = 'none';
    GRAPH_WRAPPER.style.display = 'block';
    initVis();
    getAvailableData();
  }


}

function getAvailableData() {
  // check the available data;
  getData(`../api/energyAvailability?access_token=${TOKEN}`, (data) => {
    let dataArr = JSON.parse(data);

    dataArr.sort((a,b) => {
      if (a.locationName == b.locationName) {
        if (a.name > b.name) { return 1;  }
        else                 { return -1; }
      }
      else if (a.locationName > b.locationName) {
        return 1;
      }
      else {
        return -1;
      }
    })
    dataArr.forEach((element) => {
      var el = document.createElement("option");
      el.textContent = `${element.locationName}: ${element.name} (${element.uid}) -- ${element.count} samples`;
      el.value = element.uid;
      STONE_SELECT_DROPDOWN.appendChild(el);
    })
  }, (err) => {
    console.log(err)
  })
}


function validateTokenInput() {
  let value = TOKEN_INPUT.value;
  if (value.length === 64) {
    TOKEN = value;
    TOKEN_INPUT_WRAPPER.style.display = 'none';
    GRAPH_WRAPPER.style.display = 'block';
    initVis();
    getAvailableData();
  }
}