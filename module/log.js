var fs = require('fs'),
	d = new Date();

exports.write = function(flag, text, data) {
	var year = d.getFullYear(),
		month = d.getMonth() + 1,
		date = d.getDate(),
		hours = d.getHours(),
		minutes = d.getMinutes(),
		second = d.getSeconds(),
		mili_second = d.getMilliseconds();

	var dir = 'log/' + year + month + '/';

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	const fd = fs.openSync(dir + date, 'a+');
	text = `[${year}-${month}-${date} ${hours}:${minutes}:${second}.${mili_second}] [${flag}] `+text + "\n";
	if(typeof data != 'null' && typeof data != 'undefined')
	{
		text += "------------------------------------------------------------------------------------------------\n";
		text += JSON.stringify(data);
		text += "\n------------------------------------------------------------------------------------------------\n";
	}
	fs.writeSync(fd, text, null, 'utf8');
	fs.closeSync(fd)
}