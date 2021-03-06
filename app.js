var cloudscraper = require('cloudscraper'),
	
	async = require('async'),
	movies = require('./module/movies'),
	log = require('./module/log');

var config = {
	'host': 'https://fmovies.io/latest/movies.html',
	'movies': '',
	mysql: {
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'fmovies'
	}
}

var mysql = require('mysql');

//set koneksi 

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

log.write('INFO', 'SCRAP fmovies.io STARTED')

movies.init(config);

next = true;

// set page yang akan di crawl 

page = 11;

async.whilst(function() {
		return next == true;
	},
	function(next) {
		log.write('INFO', 'Sync All page ' + page)
		movies.sync_all(page, function(length) {
			if (length == 0) {
				next = false;
			}
			page++;
			sleep.msleep(5000);

			next();
		});

	},
	function(err) {

	});

// process.exit()
