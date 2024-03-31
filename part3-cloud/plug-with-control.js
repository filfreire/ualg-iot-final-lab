var mqtt = require('mqtt');
var config = require('./config.json'); 
const http = require('http');


var thngId=config.thngId; 
var thngUrl='/thngs/'+thngId;
var thngApiKey=config.thngApiKey; 

var status=false;
var updateInterval;

var client = mqtt.connect("mqtts://mqtt.evrythng.com:8883", {
  username: 'authorization',
  password: thngApiKey
});

client.on('connect', function () {
  client.subscribe(thngUrl+'/properties/');
  client.subscribe(thngUrl+'/actions/all'); // #A
  updateProperty('livenow',true);
  setInterval(getLatestSensorValues, 5000);
  setInterval(getLatestCoapSensorValues, 5000);
});

client.on('message', function(topic, message) {
  var resources = topic.split('/');
  if (resources[1] && resources[1] === "thngs"){ // #B
    if (resources[2] && resources[2] === thngId){  // #C
      if (resources[3] && resources[3] === "properties"){ //#D
        var property = JSON.parse(message);
        console.log('Property was updated: '+property[0].key+'='+property[0].value); 
      } else if (resources[3] && resources[3] === "actions"){ //#E
        var action = JSON.parse(message);
        handleAction(action); 
      }
    }
  }
});

function handleAction(action) {
  switch(action.type) { // #F
    case '_setStatus':
      console.log('ACTION: _setStatus changed to: '+action.customFields.status); // #G
      status=Boolean(action.customFields.status);
      updateProperty ('status',status);
      /* Do something else too */
      break;
    case '_setLevel':
      console.log('ACTION: _setLevel changed to: '+action.customFields.level);
      break;
    default:
      console.log('ACTION: Unknown action type: '+action.type);
      break;
  }
}

//#A Subscribe to all actions on this thing
//#B Verify if the MQTT message is on a Thng
//#C Verify if the message is for the current Thng
//#D Check if a property was changed; if so display it
//#E Was it an action? If so call handleAction()
//#F Check the type of this action
//#G If action type is _setStatus, display the new value and do something with it


function getLatestSensorValues() {
  const options = {
    hostname: 'dfmachine.local',
    port: 8484,
    path: '/pi/sensors',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        const temperature = parsedData.temperature.value;
        const humidity = parsedData.humidity.value;
        const light = parsedData.light.value;
        const pressure = parsedData.pressure.value;
        updateProperty('temperature', temperature);
        updateProperty('humidity', humidity);
        updateProperty('light', light);
        updateProperty('pressure', pressure);
      } catch (error) {
        console.error('Error parsing response data:', error);
      }
    });
  });
  req.on('error', (error) => {
    console.error('Error making HTTP request:', error);
  });
  req.end();
}

function getLatestCoapSensorValues() {
  const options = {
    hostname: 'dfmachine.local',
    port: 8484,
    path: '/things/coapDevice/sensors/co2',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
	console.log('teste', parsedData);
        const co2 = parsedData.value;
        updateProperty('co2', co2);
      } catch (error) {
        console.error('Error parsing response data:', error);
      }
    });
  });
  req.on('error', (error) => {
    console.error('Error making HTTP request:', error);
  });
  req.end();
}

function updateProperty(property,value) {
  client.publish(thngUrl+'/properties/'+property, '[{"value": '+value+'}]');
}

process.on('SIGINT', function () {
  updateProperty('livenow',false);
  clearInterval(updateInterval);
	client.end();
  process.exit();
});
