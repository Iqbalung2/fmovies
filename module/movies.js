var cloudscraper = require('cloudscraper'),
	htmlToJson = require('html-to-json'),
	
	request = require('./request'),
	model_movies = require('./model/movies'),
	log = require('./log'),
	config = {};


exports.init = function(conf) {
	log.write('INFO', 'movies init');
	model_movies.init(conf);
	config = conf;
}

exports.get_config = function() {
	log.write('INFO', 'movies get_config', config);
	return config;
}

function html_parse_detail_movie(html, fn) {
	log.write('INFO', 'html_parse_detail_movie BEFORE');

	var res = htmlToJson.parse(html, {
		'views': function($doc, $) {
			var str = $doc.find("body > div.wrapper > div.col3 > div.col3-l > div.detail > div.detail-r > div.meta:contains('Views') > div:contains('Views')").text()
			var str_split = str.split(' ');
			return str_split[1];
		},
		'time_added': function($doc, $) {
			var d = new Date(),
				year = d.getFullYear(),
				month = d.getMonth() + 1,
				date = d.getDate();

			var str = $doc.find("body > div.wrapper > div.col3 > div.col3-l > div.eps li.selected span.year").text();
			var str_split = str.split(' ');
			if (str_split[2] == 'ago') {
				if (str_split[1] == 'days') date = date - str_split[0];
				str = `${year}-${month}-${date}`;
			}
			return str;
		},
		'release_date': function($doc, $) {
			var str = $doc.find("body > div.wrapper > div.col3 > div.col3-l > div.detail > div.detail-r > div.meta:contains('Release') > div:contains('Release')").text();
			var str_split = str.split(' ');
			return str_split[1];
		}
	}).done(function(items) {
		log.write('INFO', 'html_parse_detail_movie AFTER');
		fn(items);
	});
}

function html_parse_movie(html, fn) {
	log.write('INFO', 'html_parse_movie BEFORE');

	var res = htmlToJson.parse(html, {
		'link': function($doc, $) {
			return $doc.find('figure > a:first-child').attr('href');
		},
		'title': function($doc, $) {
			return $doc.find('figure > div.tooltip > div.title').text();
		},
		'description': function($doc, $) {
			return $doc.find('figure > div.tooltip > div.desc').text();
		},
		'image': function($doc, $) {
			return $doc.find('figure > a:first-child > img').attr('src');
		},
		'rating': function($doc, $) {
			var str = $doc.find('figure > div.tooltip > div.time').text(),
				str_split = str.split(' ');
			return `${str_split[0]}`;
		},
		'country': function($doc, $) {
			var country_sel = $doc.find("figure > div.tooltip > div.meta:contains('Country') > a"),
				country = [];

			for (var i = 0; i < country_sel.length; i++) {
				country.push($(country_sel[i]).text());
			}
			return country.join(', ');
		},
		'durasi': function($doc, $) {
			var str = $doc.find('figure > div.tooltip > div.time').text(),
				str_split = str.split(' ');
			return `${str_split[2]} ${str_split[3]}`;
		},
		'genre': function($doc, $) {
			var genre_sel = $doc.find("figure > div.tooltip > div.meta:contains('Genre') > a"),
				genre = [];

			for (var i = 0; i < genre_sel.length; i++) {
				genre.push($(genre_sel[i]).text());
			}
			return genre.join(', ');
		},
		'quality': function($doc, $) {
			var quality = $doc.find("figure > div.tooltip > div.inner").text();
			return quality;
		},
		'eps': function($doc, $) {
			return $doc.find('figure > div.eps > div').text();
		}
	}).done(function(items) {
		log.write('INFO', 'html_parse_movie AFTER');
		fn(items);
	});
}

counter = {
	req: 0,
	parse: 0,
	index: 0
};

var req_html_detail_movies = function(link, callback) {
	var link = config.host + link;

	request.getCloudFlare(link,
		function(html) {
			counter.req++;
			html_parse_detail_movie(html, function(data) {
				counter.parse++;
				callback(data);
			})
		});

}

var req_html_movies_all = function(page, callback) {
	var link = config.host + config.movies + '?page=' + page;
	log.write('INFO', 'req_html_movies_all ' + link);

	request.getCloudFlare(link,
		function(html) {
			htmlToJson.parse(html, function() {
				return this.map('body > div.wrapper > article.col2 ul:not(.pagination) li', function($item) {
					return $item.html();
				});
			}).done(function(items) {
				var l = items.length,
					data = [];

				log.write('INFO', 'Parse html movies');

				items.forEach(function(item, index) {
					html_parse_movie(item, function(res) {
						data.push(res);

						if (index == l - 1 && typeof callback == 'function') {
							callback(data);
						}
					});
				});

				if (l == 0 && typeof callback == 'function') {
					log.write('INFO', 'Movies end');
					callback(items);
				}

			}, function(err) {

			});
		});
}

var movie = {
	page: 1,
	next: true,
	data: []
};

function get_detail_movie(callback) {
	movie.data.forEach(function(item1, index1) {
		counter.index++;
		var data_rows = [];
		model_movies.select_where_link(item1, function(rows) {
			data_rows = rows;
			if (rows != 0) {
				req_html_detail_movies(item1.link, function(data) {
					movie.data.forEach(function(item2, index2) {
						if (item2.link == item1.link) {
							movie.data[index2].views = data.views;
							movie.data[index2].time_added = data.time_added;
							movie.data[index2].release_date = data.release_date;

							log.write('INFO', 'counter.req :' + counter.req + ', counter.parse: ' + counter.parse + ', counter.index: ' + counter.index);
							if (counter.req == counter.index && counter.req == counter.parse) {
								log.write('INFO', 'Get detail is finish');
								callback();
							}
						}

					});
				});
			} else {
				counter.req++;
				counter.parse++;
				log.write('INFO', 'Movies we have in db');

				log.write('INFO', 'counter.req :' + counter.req + ', counter.parse: ' + counter.parse + ', counter.index: ' + counter.index);
				if (counter.req == counter.index && counter.req == counter.parse) {
					log.write('INFO', 'Get detail is finish');
					callback();
				}
			}
			
		});
	});

}



exports.sync_all = function(page, callback) {
	counter = {
		req: 0,
		parse: 0,
		index: 0,
		inserted: 0
	};

	req_html_movies_all(page, function(data) {
		movie.data = data;
		if(data.length==0) callback(data.length);

		get_detail_movie(function() {
			movie.data.forEach(function(item2, index2) {

				log.write('INFO', 'Cek from sync');

				model_movies.select_where_link(item2, function(rows) {
					counter.inserted++;	
					if (rows.length == 0) {
						model_movies.insert(item2, function(){

						});
					}

					if(counter.inserted == counter.index)
					{
						callback(counter.inserted);
					}
				});
			});
		});

		// callback()
	});
}