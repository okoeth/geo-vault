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
var POIsByVid = null;

app.get('/', function (req, res) {
  res.render('index','Hello Vault');
});

app.post('/location', function (req, res) {
	logger.info(req.body);
	logger.info('POST: /location');
	locationsById[req.body.id] = {
        id : req.body.id,
        longitude : req.body.longitude,
        latitude : req.body.latitude,
        createdTime : new Date()
	};
    console.log(locationsById)
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
    logger.info('DATA: >>Before write');
    fs.writeFileSync('database.json', JSON.stringify(locationsById));
    logger.info('DATA: >>After write');
  callback_val = req.param('callback');
  res.end(callback_val+'('+JSON.stringify(locationsById[req.param('id')])+')')
});

app.get('/location/:id', function (req, res) {
	logger.info('GET: /location:id');
	id_val = req.param('id');
    callback_val = req.param('callback');
    res.end(callback_val+'('+JSON.stringify(locationsById[id_val])+')')
});

app.get('/call/:id', function (req, res) {
    logger.info('GET: /call:id');
    id_val = req.param('id');
    callback_val = req.param('callback');
    res.end(callback_val+'('+JSON.stringify(CallsByCid[id_val])+')')
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

// the service console can get store the POI information by this service  in the gateway
// input jsonr:{vid:"",title: "",address:"",longitude:"",latitude:""}
// output paramter: token
app.get('/poi/:id',function(req,res){
    logger.info('GET: /poi:id');
    id_val   = req.param('id');
    callback_val = req.param('callback');

    var poi = {};
    poi.title  = req.param('title').trim();
    poi.address = req.param('address').trim();
    poi.longitude = req.param('lng').trim();
    poi.latitude = req.param('lat').trim();

    var result = {};
    result.resultCode = 0;
    result.resultDesc = '';
    result.poi = poi ;
    console.log(JSON.stringify(result));

    logger.info('DATA: >>Before write');
    fs.writeFileSync('poi-database.json', JSON.stringify(result));
    logger.info('DATA: >>After write');
    res.end(callback_val +'(' + JSON.stringify(result) + ')' );
})

https.createServer(options, app).listen(443,function () {
    locationsById=JSON.parse(fs.readFileSync('database.json'));
    POIsByVid = JSON.parse(fs.readFileSync('poi-database.json'));
    CallsByCid = JSON.parse(fs.readFileSync('call-database.json'));
    logger.info('Https server listening on port ' + 443);
});

