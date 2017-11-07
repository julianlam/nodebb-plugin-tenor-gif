'use strict';

var Controllers = {};

Controllers.renderAdminPage = function (req, res, next) {
	res.render('admin/plugins/tenor-gif', {});
};

module.exports = Controllers;
