/* Copyright (c) 2011 Gaelan D'costa
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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