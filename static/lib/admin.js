'use strict';

define('admin/plugins/tenor-gif', ['settings'], function (Settings) {
	var ACP = {};

	ACP.init = function () {
		Settings.load('tenor-gif', $('.tenor-gif-settings'));

		$('#save').on('click', function () {
			Settings.save('tenor-gif', $('.tenor-gif-settings'), function () {
				app.alert({
					type: 'success',
					alert_id: 'tenor-gif-saved',
					title: 'Settings Saved',
					timeout: 5000,
				});
			});
		});
	};

	return ACP;
});
