var express = require('express'),
	_ = require('underscore'),
	debug = require('debug')('40x'),
	dAmn = require('damn');

if (process.argv.length < 4) {
	debug('DA application credentials missing. Exiting.');
	return;
}

var app = express(),
	messages = {
		'400': 'Bad request',
		'401': 'Unauthorized',
		'403': 'Nothing here !',
		'404': 'Page not found :(',
		'500': 'Whooops !',
		'502': 'Gateway is bad :('
	},
	dailyDeviations = [],
	da;

function updateDailyDeviations() {
	debug('Refreshing deviations ...');
	da.getDailyDeviations(function(err, dds) {
		dailyDeviations = _.chain(dds)
			.filter(function(deviation) {
				return deviation.content !== undefined;
			})
			.map(function(deviation) {
				return {
					author : deviation.author.username,
					preview : deviation.thumbs[1].src,
					src : deviation.content.src,
					title : deviation.title,
					url : deviation.url
				};
			})
			.value();

		debug('... fetched '+dailyDeviations.length+' deviations.');
	});
}

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
	var deviation = dailyDeviations[Math.floor(Math.random()*dailyDeviations.length)];

	debug('Displaying '+deviation.title);
	res.render('page', {
		code : req.errCode,
		message : req.query.message || messages[req.errCode] || 'Error',
		img : deviation
	}, function(err, body) {
		//debug('Returned error %s from %s', req.errCode, req.originalUrl);
		return res.status(req.errCode).send(body);
	});
});

dAmn.public(parseInt(process.argv[2]), process.argv[3], function(err, daClient) {
	da = daClient;

	updateDailyDeviations();
	setInterval(updateDailyDeviations, 60*60*1000);

	var server = app.listen(8004, '127.0.0.1', function() {
		var host = server.address().address,
			port = server.address().port;

		// We're ready
		debug('Listening on %s:%s', host, port);
	});
});
