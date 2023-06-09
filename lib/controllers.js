'use strict';

var Controllers = {};

Controllers.renderAdminPage = function (req, res, next) {
	res.render('admin/plugins/tenor-gif', {
		title: 'Tenor GIF',
	});
};

module.exports = Controllers;
