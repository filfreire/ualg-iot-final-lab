var http = require("http");
var port = 8688;
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
var exec = require('child_process').exec;
// callback function that waits for the command to be executed returns it as an string
// datatype = [Temperature, Pressure, Relative humidity]
function CaptureOutput(datatype, callback) {
    // weather1.py and http server must be in the same folder
    exec("python3 weather1.py", (error, data) => {
        callback(JSON.parse(data)[datatype])
    })
}
http.createServer(function (req, res) {
    console.log('New incoming client request for ' + req.url);
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    switch (req.url) {
        case '/temperature':
            // waits for the execution of the CaptureOutput function and writes it in the web page
            result = CaptureOutput('Temperature', (result) => {
                res.write('{"temperature" : ' + result + '}', () => {
                    res.end()
                })
            });
            break;
        case '/pressure':
            result = CaptureOutput('Pressure', (result) => {
                res.write('{"pressure" : ' + result + '}', () => {
                    res.end()
                })
            });
            break;
        case '/light':
            result = CaptureOutput('Light', (result) => {
                res.write('{"light" : ' + result + '}', () => {
                    res.end()
                })
            });
            break;
        default:
            res.write('{"hello" : "world"}', () => { res.end() });
    }
}).listen(port);
console.log('Server listening on http://localhost:' + port);