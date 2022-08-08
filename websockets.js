'use strict';

const SocketPlugins = require.main.require('./src/socket.io/plugins');
SocketPlugins['tenor-gif'] = {};

module.exports.init = function () {
	const main = module.parent.exports;

	SocketPlugins['tenor-gif'].query = function (socket, data, callback) {
		main.query(data.query).then((gifs) => {
			callback(null, gifs);
		}).catch(callback);
	};
};

