
/*
 * GET home page.
 */

exports.index = function(req, res) {
    var options = {
        hostname: 'download.finance.yahoo.com',
        path: '/d/quotes.csv?s=GOOG+NFLX+BCSI+EA+ZNGA&f=sl1'
    };

    require('http').get(options, function(response) {
        res.render('index', { title: 'Express' });
    });
};