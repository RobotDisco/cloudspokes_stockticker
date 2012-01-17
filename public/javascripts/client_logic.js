/**
 * Created by JetBrains WebStorm.
 * User: gaelan
 * Date: 17/01/12
 * Time: 2:51 AM
 * To change this template use File | Settings | File Templates.
 */
var socket = io.connect();

socket.on('stock_init', function(data) {
    var ticker = $("#webTicker");

    for(symbol in data.stocks) {
        ticker.prepend("<li id=stock_" + symbol + "><span>" + symbol + "</span><a href=#>" + data.stocks[symbol] + "</a></li>");
    }

    $("#lastUpdated").text(data.timestamp);
    $(function() {
        ticker.liScroll();
    });
});

socket.on('stock_update', function(data) {
    for(symbol in data.stocks) {
        var stock_val = $("li#stock_" + symbol + " > a");
        stock_val.text(data.stocks[symbol]);
    }
    $("#lastUpdated").text(data.timestamp);
});

setInterval(function() {
    socket.emit('request_stock_update');
}, 60000);
socket.emit('request_stock_init');