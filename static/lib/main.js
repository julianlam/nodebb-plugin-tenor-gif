'use strict';

/* globals document, window, socket, bootbox */

$(document).ready(function () {
	var Tenor = {};

	$(window).on('action:composer.enhanced', function () {
		Tenor.prepareFormattingTools();
	});

	Tenor.prepareFormattingTools = function () {
		require([
			'composer/formatting',
			'composer/controls',
			'translator',
			'benchpress',
		], function (formatting, controls, translator, Benchpress) {
			if (formatting && controls) {
				formatting.addButtonDispatch('gif', function (textarea, selectionStart, selectionEnd) {
					Benchpress.parse('plugins/tenor-gif/modal', {}, function (html) {
						var modal = bootbox.dialog({
							title: 'Insert GIF',
							message: html,
							className: 'tenor-gif-modal',
						});

						var queryEl = modal.find('#gif-query');
						var resultsEl = modal.find('#gif-results');
						var queryTimeout;

						modal.on('shown.bs.modal', function () {
							queryEl.focus();
						});

						queryEl.on('keyup', function () {
							if (!queryEl.val().length) {
								return;
							}

							if (queryTimeout) {
								clearTimeout(queryTimeout);
							}

							queryTimeout = setTimeout(function () {
								socket.emit('plugins.tenor-gif.query', {
									query: queryEl.val(),
								}, function (err, gifs) {
									if (err) {
										return resultsEl.addClass('alert', 'alert-warning').text(err.message);
									}

									Tenor.populateDOM(resultsEl, gifs);
								});
							}, 250);
						});

						resultsEl.on('click', 'img[data-url]', function () {
							var url = this.getAttribute('data-url');
							Tenor.select(textarea, selectionStart, selectionEnd, url);
							modal.modal('hide');
						});
					});
				});
			}
		});
	};

	Tenor.populateDOM = function (resultsEl, gifs) {
		require(['benchpress'], function (Benchpress) {
			Benchpress.parse('partials/tenor-gif/list', {
				gifs: gifs,
			}, function (html) {
				resultsEl.html(html);
			});
		});
	};

	Tenor.select = function (textarea, selectionStart, selectionEnd, url) {
		require([
			'composer/formatting',
			'composer/controls',
			'translator',
		], function (formatting, controls, translator) {
			translator.getTranslations(window.config.userLang || window.config.defaultLang, 'markdown', function (strings) {
				if (selectionStart === selectionEnd) {
					controls.insertIntoTextarea(textarea, '![' + strings.picture_text + '](' + url + ')');
					controls.updateTextareaSelection(textarea, selectionStart + strings.picture_text.length + 4, selectionEnd + strings.picture_text.length + url.length + 4);
				} else {
					var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '![', '](' + url + ')');
					controls.updateTextareaSelection(textarea, selectionEnd + 4 - wrapDelta[1], selectionEnd + url.length + 4 - wrapDelta[1]);
				}
			});
		});
	};
});
