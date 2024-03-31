var mqtt = require('mqtt');
var config = require('./config.json'); 

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
  if (! updateInterval) updateInterval = setInterval(updateProperties, 5000);
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


// run npm install node-fetch
const fetch = require('node-fetch');

function updateProperties() {

  fetch('http://dfmachine.local:8484/pi/sensors')
    .then(response => response.json()) // Convert the response to JSON
    .then(data => {
      const temperature = data.temperature.value;
      const humidity = data.humidity.value;
      const light = data.light.value;
      const pressure = data.pressure.value;
      updateProperty('temperature', temperature);
      updateProperty('humidity', humidity);
      updateProperty('light', light);
      updateProperty('pressure', pressure);
    })
    .catch(error => console.error('Error fetching sensor data:', error));

  fetch('http://dfmachine.local:8484/things/coapDevice/sensors/co2')
    .then(response => response.json()) // Convert the response to JSON
    .then(data => {
      const co2 = data.value;
      updateProperty('co2', co2);
    })
    .catch(error => console.error('Error fetching sensor data:', error));

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