const fs = require("fs");

module.exports = {
	read: (url) => {
		return new Promise((resolve, rejects) => {
			fs.readFile(url, (err, data) => {
				if (!err) {
					resolve(data);
				} else {
					console.log(err);
					rejects(err);
				}
			});
		});
	},
};
