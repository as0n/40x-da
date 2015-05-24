var request = require('request');

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
		da.token = body['access_token'];
		console.log('DA : got API token : %s', da.token);
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
		da.dailies.cache = body;
		da.dailies.lastRequest = new Date();
		console.log("DA : refreshed dailies.")
		return cb(err, body);
	});
};
DA.prototype.getRandomDaily = function(cb){
	this.getDailies(function(err, data) {
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