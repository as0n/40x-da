var express = require('express'),
	DA = require('./da');

var app = express(),
	da;

app.use('/static', express.static('public'));

app.get('/', function(req, res) {
	//res.set('Access-Control-Allow-Origin', '*');
	da.getDailies(function(err, data) {
		var r;

		while (true) {
			r = Math.floor(Math.random()*data.results.length);
			if (data.results[r].content) {
				return res.json({
					img: data.results[r].content.src,
					url: data.results[r].url,
					title: data.results[r].title,
					author: data.results[r].author.username
				});
			}
		}
	});
});

if (process.argv.length > 3) {
	da = new DA(process.argv[2], process.argv[3]);
	da.grabToken();

	var server = app.listen(8004, '127.0.0.1', function() {
		var host = server.address().address,
			port = server.address().port;

		// We're ready
		console.log('40XDA listening on %s:%s', host, port);
	});
}
else {
	console.log('DA application credentials missing. Exiting.');
	return;
}