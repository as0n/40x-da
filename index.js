var express = require('express'),
	debug = require('debug')('40x'),
	DA = require('./da');

if (process.argv.length < 4) {
	console.log('DA application credentials missing. Exiting.');
	return;
}

var app = express(),
	da = new DA(process.argv[2], process.argv[3]),
	messages = {
		'403': 'Nothing here :(',
		'404': 'Page not found :(',
		'500': 'Whooops !'
	};

da.grabToken();
app.set('views', './views')
app.set('view engine', 'jade');

app.get('/:code', function(req, res, next) {
	da.getRandomDaily(function(data) {
		return res.render('page', {
			code : req.params.code,
			message : req.query.message || messages[req.params.code] || 'Error',
			img : data
		});
	});
});

var server = app.listen(8004, '127.0.0.1', function() {
	var host = server.address().address,
		port = server.address().port;

	// We're ready
	debug('Listening on %s:%s', host, port);
});