var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var https = require('https');
var http = require('http');
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'all-logs.log' })
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: 'exceptions.log' })
    ]
  });
var app = express();


var options = {
  pfx: fs.readFileSync('server.pfx'),
  passphrase: '(Nttdata)'
};

app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");

// view engine setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/*
var locationsById = {
    "123" : { id: "123", longitude: "48", latitude: "52" },
    "124" : { id: "124", longitude: "32", latitude: "34" },
    "125" : { id: "125", longitude: "62", latitude: "22" }
  };
*/

var locationsById = null;

app.get('/', function (req, res) {
  res.render('Hello Vault');
});

app.post('/location', function (req, res) {
	logger.info(req.body);
	logger.info('POST: /location');
	locationsById[req.body.id] = {
        id : req.body.id,
        longitude : req.body.longitude,
        latitude : req.body.latitude
	};
  logger.info('DATA: >>Before write');
  fs.writeFileSync('database.json', JSON.stringify(locationsById));
  logger.info('DATA: >>After write');
  res.send({result:'okay'});
});

app.get('/location', function (req, res) {
	logger.info('GET: /location');
	locationsById[req.param('id')] = {
        id : req.param('id'),
        longitude : req.param('longitude'),
        latitude : req.param('latitude')
	};
  callback_val = req.param('callback');
  res.end(callback_val+'('+JSON.stringify(locationsById[req.param('id')])+')')
});

app.get('/location/:id', function (req, res) {
	logger.info('GET: /location:id');
	id_val = req.param('id');
  callback_val = req.param('callback');
  res.end(callback_val+'('+JSON.stringify(locationsById[id_val])+')')
});

app.get('/locations', function (req, res) {
	logger.info('GET: /locations');
	callback_val = req.param('callback');
  res.end(callback_val+'('+JSON.stringify(locationsById)+');')
});

app.get('/gateway', function (req, res) {
  logger.info('GET: /gateway');
  callback_val = req.param('callback');
  res.end(callback_val+'('+"{result:'okay'}"+');')
});

//http.createServer(app).listen(80,function () {
//    console.log('Http server listening on port ' + 80);
//});

https.createServer(options, app).listen(443,function () {
    locationsById=JSON.parse(fs.readFileSync('database.json'));
    logger.info('Https server listening on port ' + 443);
});

