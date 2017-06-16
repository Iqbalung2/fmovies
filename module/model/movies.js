/*CREATE TABLE movies (
	movies_id INT AUTO_INCREMENT PRIMARY KEY,
	link VARCHAR(500) NOT NULL UNIQUE,
	title VARCHAR(255),
	description TEXT,
	image VARCHAR(500),
	rating DOUBLE,
	country VARCHAR(255),
	durasi VARCHAR(255),
	genre VARCHAR(255),
	quality VARCHAR(150),
	eps INT,
	views INT,
	time_added DATETIME,
	release_date YEAR,
    insert_date DATETIME DEFAULT CURRENT_TIMESTAMP
);*/

var mysql = require('mysql'),
	log = require('./../log');

var config;

exports.init = function(conf) {
	config = conf;
	connection = mysql.createConnection(config.mysql);

	log.write('MYSQL', 'INIT', config.mysql);

	ping();
}

function ping() {
	// connection.connect(function(err) {
	// 	if (err) {
	// 		log.write('MYSQL', 'error connecting: ' + err.stack);
	// 		return false;
	// 	}
	// 	log.write('MYSQL', 'connection authenticated: ' + (connection.state == "authenticated"));
	// 	log.write('MYSQL', 'connected as id ' + connection.threadId);
	// 	log.write('MYSQL', "connection: " + connection.state);
	// 	return (connection.state == "authenticated");
	// });
}

exports.select_where_link = function(data, callback) {
	log.write('MYSQL', 'Select where link', data);

	connection.query('SELECT * FROM movies WHERE link = ?', [data.link], function(err, rows) {
		if (err) throw log.write('MYSQL', 'error query: ' + err);
		log.write('MYSQL', 'Data received from Db', rows);
		callback(rows);
	});
	
	var values = {},
		field = ['link', 'title', 'description', 'image', 'rating', 'country', 'durasi', 'genre', 'quality', 'eps', 'views', 'time_added', 'release_date'],
		sql = "INSERT INTO movies SET ?";

	field.forEach(function(itemF, indexF) {

		var val = data[itemF];
		val = (typeof val != 'undefined') ? val : '';

		if (itemF == 'eps') {
			var t = parseInt(val);
			val = isNaN(t) ? 0 : t;
		}

		values[itemF] = val;
	});

	log.write('MYSQL', "Insert into movies with data", values);

	connection.query(sql, [values], function(err, result) {
		if (err) throw log.write('MYSQL', 'error query: ' + err);
		log.write('MYSQL', "Number of records inserted: " + result.affectedRows);
		callback();
	});
}

exports.insert = function(data, callback) {
	ping();

	log.write('MYSQL', 'Try insert into movies', data);

	var values = {},
		field = ['link', 'title', 'description', 'image', 'rating', 'country', 'durasi', 'genre', 'quality', 'eps', 'views', 'time_added', 'release_date'],
		sql = "INSERT INTO movies SET ?";

	field.forEach(function(itemF, indexF) {

		var val = data[itemF];
		val = (typeof val != 'undefined') ? val : '';

		if (itemF == 'eps') {
			var t = parseInt(val);
			val = isNaN(t) ? 0 : t;
		}

		values[itemF] = val;
	});

	log.write('MYSQL', "Insert into movies with data", values);

	connection.query(sql, [values], function(err, result) {
		if (err) throw log.write('MYSQL', 'error query: ' + err);
		log.write('MYSQL', "Number of records inserted: " + result.affectedRows);
		callback();
	});
}