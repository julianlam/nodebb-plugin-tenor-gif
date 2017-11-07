'use strict';

/* globals $, app, socket */

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
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function () {
						socket.emit('admin.reload');
					},
				});
			});
		});
	};

	return ACP;
});
