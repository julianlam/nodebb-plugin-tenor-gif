'use strict';

var controllers = require('./lib/controllers');
var websockets = require('./websockets');
var meta = require.main.require('./src/meta');
var winston = require.main.require('winston');

var request = require('request');

var plugin = {
	_settings: {
		key: null,
	},
};

plugin.init = function (params, callback) {
	var router = params.router;
	var hostMiddleware = params.middleware;

	router.get('/admin/plugins/tenor-gif', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/tenor-gif', controllers.renderAdminPage);

	websockets.init();
	plugin.refreshSettings(callback);
};

plugin.refreshSettings = function (callback) {
	meta.settings.get('tenor-gif', function (err, settings) {
		Object.assign(plugin._settings, settings);

		if (!settings.key || !settings.key.length) {
			winston.warn('[plugin/tenor-gif] Invalid or missing API Key, plugin disabled');
		}

		callback(err);
	});
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/tenor-gif',
		icon: 'fa-tint',
		name: 'Tenor GIF',
	});

	callback(null, header);
};

plugin.registerFormatting = function (payload, callback) {
	if (!plugin._settings.key) {
		return setImmediate(callback, null, payload);
	}

	payload.options.push({ name: 'gif', className: 'fa fa-tenor-gif', title: 'Insert GIF' });
	callback(null, payload);
};

plugin.query = function (query, callback) {
	request({
		url: 'https://api.tenor.com/v1/search?q=' + query + '&key=' + plugin._settings.key,
		method: 'get',
		json: true,
	}, function (err, res, body) {
		if (!plugin._settings.key || body.hasOwnProperty('error')) {
			err = new Error('[[error:invalid-login-credentials]]');
		}

		if (err) {
			return callback(err);
		}

		// Collapse results down to array of images
		var gifs = body.results.reduce(function (memo, cur) {
			memo.push({
				url: cur.media[0].gif.url,
				thumb: cur.media[0].tinygif.url,
			});

			return memo;
		}, []);

		callback(null, gifs);
	});
};

module.exports = plugin;
