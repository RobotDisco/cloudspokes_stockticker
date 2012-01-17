/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

// Configuration

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

// Update stock info (every five minutes)
var options = {
    hostname: 'download.finance.yahoo.com',
    path: '/d/quotes.csv?s=GOOG+NFLX+BCSI+EA+ZNGA&f=sl1'
};

var stock_data = {};

var cron = require('cron2');
new cron.CronJob('0 */1 * * * *', function() {
    require('http').get(options, function(response) {
        var body="";

        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var csv = require('csv');
            var payload = csv().from(body, { columns: false });

            payload.on('data', function(data, index) {
                stock_data[data[0]] = data[1];
            });

            payload.on('end', function() {
            // TODO update clients here?
                console.log("Stock Data updated");
            });
        });
    });
});

// Socket.io

io.sockets.on('connection', function(socket) {
    socket.on('request_stock_update', function(data) {
        console.log("Stock update requested");
        socket.emit('stock_update', stock_data);
    });
    socket.on('request_stock_init', function(data) {
        console.log("Stock init requested");
        socket.emit('stock_init', stock_data);
    });
});

// Routes

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
