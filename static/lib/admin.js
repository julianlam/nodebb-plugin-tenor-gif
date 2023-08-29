'use strict';

define('admin/plugins/tenor-gif', ['settings'], function (Settings) {
	var ACP = {};

	ACP.init = function () {
		Settings.load('tenor-gif', $('.tenor-gif-settings'));

		$('#save').on('click', function () {
			Settings.save('tenor-gif', $('.tenor-gif-settings'));
		});
	};

	return ACP;
});
