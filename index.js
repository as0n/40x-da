var express = require('express'),
	debug = require('debug')('40x'),
	DA = require('./da');

if (process.argv.length < 4) {
	debug('DA application credentials missing. Exiting.');
	return;
}

var app = express(),
	da = new DA(process.argv[2], process.argv[3]),
	messages = {
		'400': 'Bad request',
		'401': 'Unauthorized',
		'403': 'Nothing here !',
		'404': 'Page not found :(',
		'500': 'Whooops !',
		'502': 'Gateway is bad :('
	};

app.set('views', './views')
app.set('view engine', 'jade');

app.get('/', function(req, res, next) {
	req.errCode = 404;
	return next();
});
app.get('/:code', function(req, res, next) {
	req.errCode = (req.params.code) || 404;
	return next();
});
app.use(function (req, res, next) {
	da.getRandomDaily(function(data) {
		res.render('page', {
			code : req.errCode,
			message : req.query.message || messages[req.errCode] || 'Error',
			img : data
		}, function(err, body) {
			//debug('Returned error %s from %s', req.errCode, req.originalUrl);
			return res.status(req.errCode).send(body);
		});
	});
});

da.grabToken(function(err) {
	if (err) {
		return debug('Failed client authentification. Exiting');
	}

	var server = app.listen(8004, '127.0.0.1', function() {
		var host = server.address().address,
			port = server.address().port;

		// We're ready
		debug('Listening on %s:%s', host, port);
	});
});