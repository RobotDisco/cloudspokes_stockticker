/**
 * Created by JetBrains WebStorm.
 * User: gaelan
 * Date: 17/01/12
 * Time: 2:51 AM
 * To change this template use File | Settings | File Templates.
 */
var socket = io.connect();

socket.on('stock_init', function(data) {
    /* Because our chosen ticker widget doesn't
     * handle run-time removal and additions of
     * entry elements particularly well, I've
     * chosen to create elements on page load
     * and update their text values on
     * updates.
     */

    var ticker = $("#webTicker");

    for(symbol in data.stocks) {
        ticker.prepend("<li id=stock_" + symbol + "><span>" + symbol + "</span><a href=#>" + data.stocks[symbol] + "</a></li>");
    }

    $("#lastUpdated").text(data.timestamp);

    // Set up jQuery stock ticker widget
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

// We should refresh our stock data every so often
setInterval(function() {
    socket.emit('request_stock_update');
}, 60000);

// Request initial stock values on page load
socket.emit('request_stock_init');