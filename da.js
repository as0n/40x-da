var request = require('request'),
	apiDebug = require('debug')('da:api'),
	tokenDebug = require('debug')('da:token'),
	ddDebug = require('debug')('da:dd');

function DA(client_id, client_secret) {
	this.client_id = client_id;
	this.client_secret = client_secret;

	this.dailies = {
		cache : null,
		lastRequest : 0
	}
}
DA.cacheExpiry = 60*60*1000; //1h

DA.prototype.request = function(url, qs, cb) {
	var da = this;
	qs.access_token = this.token;

	request({
		url : url,
		qs : qs,
		json : true
	}, function(err, resp, body) {
		if (err) {
			apiDebug('Error while getting %s : %s', url, err);
			return cb(err);
		}
		if (body['error']) {
			switch(body['error']) {
				case 'invalid_request':
					//apiDebug(body['error_description']);
				case 'invalid_token':
					tokenDebug('Refreshing token ...')
					return da.grabToken(function() {
						da.request(url, qs, cb);
					});
				default:
					apiDebug('DA returned an error while getting %s : %s\n%s', url, body['error'], body['error_description']);
					return cb(body['error']);
			}
		}

		cb(null, body);
	})
};

DA.prototype.grabToken = function(cb) {
	var da = this;

	this.request('https://www.deviantart.com/oauth2/token', {
		client_id: this.client_id,
		client_secret: this.client_secret,
		grant_type: "client_credentials"
	}, function(err, data) {
		if (err) {
			tokenDebug('Got error while fetching token : %s', err);
			return cb(err);
		}
		
		da.token = data['access_token'];
		tokenDebug('Got token : %s', da.token);
		if (cb) cb();
	});
};

DA.prototype.getDailies = function(cb) {
	var da = this;
	if (new Date() - this.dailies.lastRequest <= DA.cacheExpiry) {
		return cb(false, this.dailies.cache);
	}

	this.request('https://www.deviantart.com/api/v1/oauth2/browse/dailydeviations?mature_content=true', {}, function(err, data) {
		if (err) {
			ddDebug('Error while fetching DD : %s', err);
			return cb(err);
		}

		da.dailies.cache = data;
		da.dailies.lastRequest = new Date();
		ddDebug("Refreshed dailies.");
		return cb(null, data);
	});
};

DA.prototype.getRandomDaily = function(cb){
	this.getDailies(function(err, data) {
		if (err) {
			ddDebug('Error while getting DD : %s', err);
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