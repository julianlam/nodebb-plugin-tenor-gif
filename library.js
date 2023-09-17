'use strict';

const request = require('request-promise-native');

const controllers = require('./lib/controllers');
const websockets = require('./websockets');

const nconf = require.main.require('nconf');
const meta = require.main.require('./src/meta');
const slugify = require.main.require('./src/slugify');
const ttlCache = require.main.require('./src/cache/ttl');

const plugin = module.exports;

plugin._cache = ttlCache({
	name: 'tenor-gif',
	ttl: 1000 * 60 * 60, // 1 hour
});

plugin.init = async (params) => {
	const { router } = params;
	const hostMiddleware = params.middleware;

	router.get('/admin/plugins/tenor-gif', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/tenor-gif', controllers.renderAdminPage);

	websockets.init();
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/tenor-gif',
		icon: 'fa-tint',
		name: 'Tenor GIF',
	});

	callback(null, header);
};

plugin.registerFormatting = async (payload) => {
	const { key } = await meta.settings.get('tenor-gif');
	if (key) {
		payload.options.push({ name: 'gif', className: 'fa fa-tenor-gif', title: 'Insert GIF' });
	}

	return payload;
};

plugin.filterMessagingLoadRoom = (payload) => {
	payload.room.composerActions.push({
		action: 'tenor-gif',
		class: 'd-none d-md-flex',
		icon: 'fa-tenor-gif',
		title: 'Tenor GIF',
	});
	return payload;
};

plugin.query = async (query) => {
	let { contentFilter, key, limit } = await meta.settings.get('tenor-gif');
	if (!limit || limit < 1 || limit > 50) {
		limit = 15;
	}

	query = String(query).trim();
	const commonArgs = `&limit=${limit}&contentfilter=${contentFilter || 'medium'}&key=${key}&client_key=nodebb-${slugify(nconf.get('url'))}`;
	let url = `https://tenor.googleapis.com/v2/featured?type=featured${commonArgs}`;
	if (query) {
		url = `https://tenor.googleapis.com/v2/search?q=${query}${commonArgs}`;
	}

	let gifs = plugin._cache.get(query);
	if (gifs) {
		return gifs;
	}

	const body = await request({
		url,
		method: 'get',
		json: true,
	});

	if (!key || (body && body.hasOwnProperty('error'))) {
		throw new Error('[[error:invalid-login-credentials]]');
	}

	// Malformed return handling
	if (!body.results) {
		throw new Error('[[error:invalid-data]]');
	}

	// Collapse results down to array of images
	gifs = body.results.reduce((memo, cur) => {
		memo.push({
			url: cur.media_formats.gif.url,
			thumb: cur.media_formats.tinygif.url,
			alt: cur.content_description,
		});

		return memo;
	}, []);

	plugin._cache.set(query, gifs);
	return gifs;
};
