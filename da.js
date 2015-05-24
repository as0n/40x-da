var request = require('request'),
	tokenDebug = require('debug')('da:token'),
	dailiesDbg = require('debug')('da:dailies');

function DA(client_id, client_secret) {
	this.client_id = client_id;
	this.client_secret = client_secret;

	this.dailies = {
		cache : null,
		lastRequest : 0
	}
}
DA.cacheExpiry = 60*60*1000; //1h

DA.prototype.grabToken = function() {
	var da = this;

	request({
		url: 'https://www.deviantart.com/oauth2/token',
		qs: {
			client_id: this.client_id,
			client_secret: this.client_secret,
			grant_type: "client_credentials"
		},
		json: true
	}, function(err, res, body) {
		if (err) return tokenDebug('Got error while fetching token : %s', err);
		if (body['error']) return tokenDebug('DeviantArt returned an error while fetching token : %s\n%s', body['error'], body['error_description']);

		da.token = body['access_token'];
		tokenDebug('Got token : %s', da.token);
	});
};
DA.prototype.getDailies = function(cb) {
	var da = this;
	if (new Date() - this.dailies.lastRequest <= DA.cacheExpiry) {
		return cb(false, this.dailies.cache);
	}

	request({
		url: 'https://www.deviantart.com/api/v1/oauth2/browse/dailydeviations?mature_content=true',
		qs: {
			access_token: this.token
		},
		json: true
	}, function(err, resp, body) {
		if (err) {
			dailiesDbg('Error while fetching DD : %s', err);
			return cb(err);
		}
		if (body['error']) {
			dailiesDbg('DeviantArt returned an error while fetching dd : %s\n%s', body['error'], body['error_description']);
			return cb(body['error']);
		}

		da.dailies.cache = body;
		da.dailies.lastRequest = new Date();
		dailiesDbg("Refreshed dailies.");
		return cb(err, body);
	});
};
DA.prototype.getRandomDaily = function(cb){
	this.getDailies(function(err, data) {
		if (err) {
			dailiesDbg('Error while getting DD : %s', err);
			return cb();
		}
		var r;

		while (true) {
			r = Math.floor(Math.random()*data.results.length);
			if (data.results[r].content) {
				return cb({
					src : data.results[r].content.src,
					url: data.results[r].url,
					title: data.results[r].title,
					author: data.results[r].author.username
				});
			}
		}
	});
};

module.exports = DA;