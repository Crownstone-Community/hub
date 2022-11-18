let VIS_CONTAINER;
let STONE_SELECT_DROPDOWN;
let TOKEN;
let SHOW_RAW;
let GRAPH_WRAPPER;
let TOKEN_INPUT_WRAPPER;
let TOKEN_INPUT;

let FROM_DATE;
let FROM_TIME;
let UNTIL_DATE;
let UNTIL_TIME;

let SAMPLE_COUNT;

let DATA_TYPE_E;
let DATA_TYPE_P;

let UNITS_WRAPPER;
let UNITS_TYPE_J;
let UNITS_TYPE_Wh;
let UNITS_TYPE_kWh;

let SAMPLING_CHECKBOX;

let PRESENTATION_ENERGY_WRAPPER;
let PRESENTATION_ENERGY_TYPE_cumulative;
let PRESENTATION_ENERGY_TYPE_time_block;

let TIMESTEP_SELECTOR;

let PRESENTATION_POWER_WRAPPER;
let PRESENTATION_POWER_TYPE_average;
let PRESENTATION_POWER_TYPE_block;

let DATA_SOURCE_WRAPPER;
let DATA_SOURCE_type_processed;
let DATA_SOURCE_type_raw;
let DATA_SOURCE_type_raw_corrected;

function initDOM() {
  STONE_SELECT_DROPDOWN = document.getElementById("stoneSelector");
  GRAPH_WRAPPER         = document.getElementById("graphWrapper");
  TOKEN_INPUT_WRAPPER   = document.getElementById("tokenInputWrapper");
  TOKEN_INPUT           = document.getElementById("tokenInput");
  FROM_DATE             = document.getElementById("fromDate");
  FROM_TIME             = document.getElementById("fromTime");
  UNTIL_DATE            = document.getElementById("untilDate");
  UNTIL_TIME            = document.getElementById("untilTime");
  SAMPLE_COUNT          = document.getElementById("sampleCount");
  DATA_TYPE_E           = document.getElementById("dataType1");
  DATA_TYPE_P           = document.getElementById("dataType2");
  UNITS_WRAPPER         = document.getElementById("unitsWrapper");
  UNITS_TYPE_J          = document.getElementById("unitType1");
  UNITS_TYPE_Wh         = document.getElementById("unitType2");
  UNITS_TYPE_kWh        = document.getElementById("unitType3");
  SAMPLING_CHECKBOX     = document.getElementById("samplingCheckbox");
  PRESENTATION_ENERGY_WRAPPER         = document.getElementById("presentationEnergyWrapper");
  PRESENTATION_ENERGY_TYPE_cumulative = document.getElementById("presentationType1");
  PRESENTATION_ENERGY_TYPE_time_block = document.getElementById("presentationType2");
  TIMESTEP_SELECTOR                   = document.getElementById("timeslotSelector");

  PRESENTATION_POWER_WRAPPER          = document.getElementById("presentationPowerWrapper");
  PRESENTATION_POWER_TYPE_average     = document.getElementById("presentationPowerType1");
  PRESENTATION_POWER_TYPE_block       = document.getElementById("presentationPowerType2");

  DATA_SOURCE_WRAPPER                 = document.getElementById("dataSourceWrapper");
  DATA_SOURCE_type_processed          = document.getElementById("datasourceType1");
  DATA_SOURCE_type_raw                = document.getElementById("datasourceType2");
  DATA_SOURCE_type_raw_corrected      = document.getElementById("datasourceType3");

  FROM_DATE.value = new Date().toISOString().substr(0,10)
  UNTIL_DATE.value = new Date().toISOString().substr(0,10)

  const urlParams = new URLSearchParams(window.location.search);
  TOKEN = urlParams.get('access_token');
  SHOW_RAW = urlParams.get('show_raw') || false;
  if (SHOW_RAW !== false) {
    DATA_SOURCE_WRAPPER.style.display = 'block';
  }

  VIS_CONTAINER = document.getElementById("visualization")

  if (TOKEN) {
    TOKEN_INPUT_WRAPPER.style.display = 'none';
    GRAPH_WRAPPER.style.display = 'block';
    initVis();
    getAvailableData();
  }

  determineDataType();
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
      el.textContent = `${element.locationName}: ${element.name} (${element.uid})`;
      el.value = element.uid;
      STONE_SELECT_DROPDOWN.appendChild(el);
    });
  }, (err) => {
    console.log(err)
  })
}


function validateTokenInput() {
  let value = ACCESS_TOKEN || TOKEN_INPUT.value;
  if (value.length === 64) {
    window.location.href = window.location.href + "?access_token="+value;
    TOKEN = value;
    localStorage.setItem('accessToken', ACCESS_TOKEN);
    TOKEN_INPUT_WRAPPER.style.display = 'none';
    GRAPH_WRAPPER.style.display = 'block';
    initVis();
    getAvailableData();
  }
}

let USE_DATA_TYPE = "P";
let ENERGY_PRESENTATION = "CUMULATIVE";
let TIME_STEP = '1m';
let ENERGY_UNITS = "J";
let POWER_PRESENTATION = "AVERAGE";
let DATA_SOURCE = "PROCESSED";

function determineDataType() {
  if (DATA_TYPE_E.checked) {
    USE_DATA_TYPE = "E"
    PRESENTATION_ENERGY_WRAPPER.style.display = 'block';
    UNITS_WRAPPER.style.display = 'block';
    if (ENERGY_PRESENTATION !== "CUMULATIVE") {
      PRESENTATION_POWER_WRAPPER.style.display = 'block'
    }
    else {
      PRESENTATION_POWER_WRAPPER.style.display = 'none'
    }
  }
  else {
    USE_DATA_TYPE = "P";
    PRESENTATION_ENERGY_WRAPPER.style.display = 'none';
    PRESENTATION_POWER_WRAPPER.style.display = 'block'
    UNITS_WRAPPER.style.display = 'none';
  }
  drawData();
}

function determineDataSource() {
  if (DATA_SOURCE_type_processed.checked) {
    DATA_SOURCE = "PROCESSED"
  }
  else if (DATA_SOURCE_type_raw.checked) {
    DATA_SOURCE = "RAW"
  }
  else if (DATA_SOURCE_type_raw_corrected.checked) {
    DATA_SOURCE = "RAW_CORRECTED"
  }
  refreshData();
}

function determineUnitsType() {
  if (UNITS_TYPE_J.checked) {
    ENERGY_UNITS = 'J';
  }
  else if (UNITS_TYPE_Wh.checked) {
    ENERGY_UNITS = 'Wh';
  }
  else {
    ENERGY_UNITS = 'kWh';
  }
  drawData();
}

function determinePresentationType() {
  if (USE_DATA_TYPE === 'E') {
    if (PRESENTATION_ENERGY_TYPE_cumulative.checked) {
      ENERGY_PRESENTATION = 'CUMULATIVE';
      PRESENTATION_POWER_WRAPPER.style.display = 'none'
    }
    else if (PRESENTATION_ENERGY_TYPE_time_block.checked) {
      ENERGY_PRESENTATION = 'PER_TIME_STEP';
      PRESENTATION_POWER_WRAPPER.style.display = 'block'
    }
  }
  if (PRESENTATION_POWER_TYPE_block.checked) {
    POWER_PRESENTATION = 'BLOCK';
  }
  else {
    POWER_PRESENTATION = 'AVERAGE';
  }
  refreshData();
}

function timeStepChanged() {
  TIME_STEP = TIMESTEP_SELECTOR.value;

  refreshData();
}
