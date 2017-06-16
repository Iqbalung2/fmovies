var cloudscraper = require('cloudscraper'),
	log = require('./log');

exports.getCloudFlare = function(url, fn){
	log.write('DEBUG', `GET: ${url} STATUS: WAITING`);

	cloudscraper.get(url, function(error, response, body) {
		if (error) {
			log.write('DEBUG', `GET: ${url} STATUS: Error occurred`, error);
		} else {
			log.write('DEBUG', `GET: ${url} STATUS: OK`);

			if(typeof fn == 'function'){
				fn(body);
			}
		}
	});
}

exports.postCloudFlare = function(url){
	log.write('DEBUG', `POST: ${url} STATUS: WAITING`);

	cloudscraper.post(url, function(error, response, body) {
		if (error) {
			log.write('DEBUG', `POST: ${url} STATUS: Error occurred`, error);
		} else {
			log.write('DEBUG', `POST: ${url} STATUS: OK`);

			if(typeof fn == 'function'){
				fn(body);
			}
		}
	});
}