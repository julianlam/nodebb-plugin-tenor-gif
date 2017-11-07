'use strict';

var SocketPlugins = require.main.require('./src/socket.io/plugins');
SocketPlugins['tenor-gif'] = {};

module.exports.init = function () {
	var main = module.parent.exports;

	SocketPlugins['tenor-gif'].query = function (socket, data, callback) {
		main.query(data.query, callback);
	};
};

