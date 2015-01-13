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

var locationsById = null;
var POIsByVid = null;

app.get('/', function (req, res) {
    res.render("index","hello");
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
app.get('/locations', function (req, res) {
    logger.info('GET: /locations');
    callback_val = req.param('callback');
    res.end(callback_val+'('+JSON.stringify(locationsById)+');')
});
app.get('/location/:id', function (req, res) {
    logger.info('GET: /location:id');
    id_val = req.param('id');
    callback_val = req.param('callback');
    res.end(callback_val+'('+JSON.stringify(locationsById[id_val])+')')
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


app.get('/call/:id', function (req, res) {
    logger.info('GET: /call:id');
    id_val = req.param('id');
    callback_val = req.param('callback');
    res.end(callback_val+'('+JSON.stringify(CallsByCid[id_val])+')')
});

// the service console can get store the POI information by this service  in the gateway
// input jsonr:{vid:"",title: "",address:"",longitude:"",latitude:""}
// output paramter: token
app.get('/poi/:id',function(req,res){
    logger.info('GET: /poi:id');
    id_val   = req.param('id');
    callback_val = req.param('callback');

    console.log(req);

    var arrLength = POIsByVid['poi'].length;
    POIsByVid['poi'][arrLength] = {};


    POIsByVid['poi'][arrLength].vin = req.param('vin').trim();
    POIsByVid['poi'][arrLength].callid = '';
    POIsByVid['poi'][arrLength].title = req.param('title').trim();
    POIsByVid['poi'][arrLength].address = req.param('address').trim();
    POIsByVid['poi'][arrLength].longitude = req.param('lng').trim();
    POIsByVid['poi'][arrLength].latitude = req.param('lat').trim();
    POIsByVid['poi'][arrLength].datetime = new Date();

    var result = {};
    result.resultCode = 0;
    result.resultDesc = '';

    logger.info('DATA: >>Before write');
    fs.writeFileSync('poi-database.json', JSON.stringify(POIsByVid));
    logger.info('DATA: >>After write');
    res.end(callback_val +'(' + JSON.stringify(result) + ')' );
})

// when cc closed the call, the service console will invoke this interface to finalize items below:
//  1- pass in vid and callid;
//  2- lookup all the vid related POI record;
//  3- find out all the callid null valued record, set the callid value to all these records

//  -  input json:{id:"",vid: ""}
//     -> id means call id
//     -> vid means the vehicle id
//  -  output parameter: {resultCode:0,resultDesc:''}
app.get('/poi-call/:id',function(req,res){
    logger.info('GET: /poi-call:id');
    id_val   = req.param('id');
    callback_val = req.param('callback');

    var vid = req.param('vid');
    var callid = req.param('callid');

    for (var poiCount = 0;poiCount < POIsByVid['poi'].length;poiCount++){
        if(POIsByVid['poi'][poiCount].vid == vid && POIsByVid['poi'][poiCount].callid == ''){
            POIsByVid['poi'][poiCount].callid = callid;
        }
    }

    var result = {};
    result.resultCode = 0;
    result.resultDesc = '';

    logger.info('DATA: >>Before write');
    fs.writeFileSync('poi-database.json', JSON.stringify(POIsByVid));
    logger.info('DATA: >>After write');
    res.end(callback_val +'(' + JSON.stringify(result) + ')' );
})

app.get("/log",function(req,res){
    var options = {
        from: new Date - 10 * 24 * 60 * 60 * 1000,
        until: new Date,
        limit: 100,
        start: 0,
        order: 'desc',
        fields: ['level','message','timestamp']
    };

    logger.query(options, function (err, results) {
        if (err) {
            throw err;
        }
        /*var files = results.file;
        console.log(files);*/
        res.render('log',{files:results.file});
    });
})

app.get("/data",function(req,res){
    var locations  = [];
    var POIs = [];
    var arrLocCount = 0;
    for(var key in locationsById){
        locations[arrLocCount] = locationsById[key];
        arrLocCount ++;
    }

    var arrCallLocCount = 0;
    var callLocations = [];
    for(var key in CallsByCid){
        for(var locCount =0;locCount < CallsByCid[key].length; locCount ++){
            CallsByCid[key][locCount].token = key;
            callLocations[arrCallLocCount] = CallsByCid[key][locCount];
            arrCallLocCount++;
        }
    }

    var arrPOIsLocCount = 0;
    var poiLocations = [];

    for(var poiCount = 0;poiCount <  POIsByVid['poi'].length; poiCount ++){
        poiLocations[arrPOIsLocCount] = POIsByVid['poi'][poiCount];
        arrPOIsLocCount++;
    }
    res.render('data',{locations:locations,callLocations:callLocations,poiLocations:poiLocations});
})

app.get('/gateway', function (req, res) {
  logger.info('GET: /gateway');
  callback_val = req.param('callback');
  res.end(callback_val+'('+"{result:'okay'}"+');')
});


https.createServer(options, app).listen(443,function () {
    locationsById=JSON.parse(fs.readFileSync('database.json'));
    POIsByVid = JSON.parse(fs.readFileSync('poi-database.json'));
    CallsByCid = JSON.parse(fs.readFileSync('call-database.json'));
    logger.info('Https server listening on port ' + 443);
});

