'use strict';

const request = require('request');

const controllers = require('./lib/controllers');
const websockets = require('./websockets');

const meta = require.main.require('./src/meta');
const winston = require.main.require('winston');

const plugin = {
	_settings: {
		key: null,
	},
};

plugin.init = function (params, callback) {
	const { router } = params;
	const hostMiddleware = params.middleware;

	router.get('/admin/plugins/tenor-gif', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/tenor-gif', controllers.renderAdminPage);

	websockets.init();
	plugin.refreshSettings(callback);
};

plugin.refreshSettings = function (callback) {
	meta.settings.get('tenor-gif', (err, settings) => {
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
	if (plugin._settings.key) {
		payload.options.push({ name: 'gif', className: 'fa fa-tenor-gif', title: 'Insert GIF' });
	}

	callback(null, payload);
};

plugin.query = function (query, callback) {
	request({
		url: `https://tenor.googleapis.com/v2/search?q=${query}&key=${plugin._settings.key}`,
		method: 'get',
		json: true,
	}, (err, res, body) => {
		if (!plugin._settings.key || (body && body.hasOwnProperty('error'))) {
			err = new Error('[[error:invalid-login-credentials]]');
		}

		// Malformed return handling
		if (!body || !body.results) {
			return callback(new Error('[[error:invalid-data]]'));
		}

		if (err) {
			return callback(err);
		}

		// Collapse results down to array of images
		const gifs = body.results.reduce((memo, cur) => {
			memo.push({
				url: cur.media_formats.gif.url,
				thumb: cur.media_formats.tinygif.url,
			});

			return memo;
		}, []);

		callback(null, gifs);
	});
};

module.exports = plugin;
