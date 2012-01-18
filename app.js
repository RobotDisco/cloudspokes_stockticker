// Configuration variables

/* List of stock symbols we want to track.
 * Change them as desired. There is no
 * validation done to ensure that the stock
 * is valid or tracked by Yahoo Finance
 */
var stock_symbols = [
    "GOOG",
    "NFLX",
    "BCSI",
    "EA",
    "ZNGA",
    "AAPL",
    "APP",
    "CRM",
    "TLM.TO",
    "DCM"
];
// Desired update interval for stock data, in minutes
var UPDATE_INTERVAL=5;


// Server logic follows
var stock_data = {}; // holds our rolling stock information.

var refresh_stock_data = function() {
    var request_options = {
        host: 'download.finance.yahoo.com',
        path: '/d/quotes.csv?s=' + stock_symbols.join('+') + '&f=sl1',
        port: 80
    };

    require('http').get(request_options, function(response) {
        var body="";

        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var csv = require('csv');
            var payload = csv().from(body, { columns: false });

            payload.on('data', function(data, index) {
                stock_data[data[0]] = '$' + data[1];
            });

            payload.on('end', function() {
                console.log("Stock Data updated");
            });
        });
    });
};


// Set up express and socket.io framework
var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);


// Express Configuration profiles
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// Routes
app.get('/', routes.index);


// We should update stock info periodically
var cron = require('cron2');
new cron.CronJob('0 */' + UPDATE_INTERVAL + ' * * * *', refresh_stock_data);


// Websocket logic
io.sockets.on('connection', function(socket) {
    socket.on('request_stock_update', function(data) {
        console.log("Stock update requested");
        socket.emit('stock_update', { stocks: stock_data, timestamp: Date() });
    });
    socket.on('request_stock_init', function(data) {
        console.log("Stock init requested");
        socket.emit('stock_init', { stocks: stock_data, timestamp: Date() });
    });
});


// Prime stock data before accepting requests
refresh_stock_data();


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
