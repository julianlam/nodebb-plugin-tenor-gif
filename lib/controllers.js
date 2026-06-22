'use strict';

const Controllers = module.exports;

Controllers.renderAdminPage = function (req, res) {
	res.render('admin/plugins/tenor-gif', {
		title: 'KLIPY (Tenor GIF)',
	});
};

