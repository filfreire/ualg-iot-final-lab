var resources = require('../../resources/model.js'),
  utils = require('../../utils/utils.js');

const { execSync } = require('child_process');


var interval, sensor;
var model = resources.pi.sensors;
var pluginName = 'Enviro+';
var localParams = { 'simulate': false, 'frequency': 5000 };

exports.start = function (params) {
  localParams = params;
  if (params.simulate) {
    simulate();
  } else {
    connectHardware();
  }
};

exports.stop = function () {
  if (params.simulate) {
    clearInterval(interval);
  } else {
    sensor.unexport();
  }
  console.info('%s plugin stopped!', pluginName);
};

function connectHardware() {
  // var sensorDriver = require('node-dht-sensor');
  var sensor = {
    initialize: function () {
      return {}; //#A
    },
    read: async function () {
      var readout = {}; //#B

      try {
        const outputBuffer = execSync('python3 weather1.py');
        const outputString = outputBuffer.toString();
        readout = JSON.parse(outputString);
      } catch (err) {
        console.error(err);
      }

      model.temperature.value = parseFloat(readout.temperature);
      model.humidity.value = parseFloat(readout.humidity); //#C
      model.pressure.value = parseFloat(readout.pressure);
      model.light.value = parseFloat(readout.light);
      showValue();

      setTimeout(function () {
        sensor.read(); //#D
      }, localParams.frequency);
    }
  };
  if (sensor.initialize()) {
    console.info('Hardware %s sensor started!', pluginName);
    sensor.read();
  } else {
    console.warn('Failed to initialize sensor!');
  }
};

function simulate() {
  interval = setInterval(function () {
    model.temperature.value = utils.randomInt(0, 40);
    model.humidity.value = utils.randomInt(0, 100);
    model.pressure.value = utils.randomInt(0, 40);
    model.light.value = utils.randomInt(0, 100);
    showValue();
  }, localParams.frequency);
  console.info('Simulated %s sensor started!', pluginName);
};

function showValue() {
  console.info('Temperature: %s C, humidity %s, pressure %s, light %s \%',
    model.temperature.value, model.humidity.value, model.pressure.value, model.light.value);
};

//#A Initialize the driver for DHT22 on GPIO 12 (as specified in the model)
//#B Fetch the values from the sensors
//#C Update the model with the new temperature and humidity values; note that all observers will be notified
//#D Because the driver doesn’t provide interrupts, you poll the sensors for new values on a regular basis with a regular timeout function and set sensor.read() as a callback
