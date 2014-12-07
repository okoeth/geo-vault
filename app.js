var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

app.set('port', (process.env.PORT || 3000));

// view engine setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

var locationsById = {
    "123" : { id: "123", longitude: "48", latitude: "52" },
    "124" : { id: "124", longitude: "32", latitude: "34" },
    "125" : { id: "125", longitude: "62", latitude: "22" }
  };

app.get('/', function (req, res) {
  res.end('Hi there!')
});

app.post('/location', function (req, res) {
	console.log('POST: /location');
	locationsById[req.body.id] = {
        id : req.body.id,
        longitude : req.body.longitude,
        latitude : req.body.latitude
	};
  	res.end("ok")
});

app.get('/location', function (req, res) {
	console.log('GET: /location');
	locationsById[req.param('id')] = {
        id : req.param('id'),
        longitude : req.param('longitude'),
        latitude : req.param('latitude')
	};
  	res.end('vaultLocation('+JSON.stringify(locationsById[req.param('id')])+')')
});

app.get('/location/:id', function (req, res) {
	console.log('GET: /location:id');
	id_val = req.param('id');
  	res.end('vaultLocation('+JSON.stringify(locationsById[id_val])+')')
});

app.get('/locations', function (req, res) {
	console.log('GET: /locations');
	callback_val = req.param('callback');
  	res.end(callback_val+'('+JSON.stringify(locationsById)+');')
});


module.exports = app;

