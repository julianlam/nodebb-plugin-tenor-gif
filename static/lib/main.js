'use strict';

$(document).ready(function () {
	var Tenor = {};

	$(window).on('action:composer.enhanced', function () {
		Tenor.prepareFormattingTools();
	});

	$(window).on('action:redactor.load', function () {
		Tenor.initRedactor.apply(this, arguments);
	});

	$(window).on('action:composer.loaded', function () {
		if ($.Redactor && $.Redactor.opts.plugins.indexOf('tenor-gif') === -1) {
			$.Redactor.opts.plugins.push('tenor-gif');
		}
	});

	Tenor.prepareFormattingTools = function () {
		require([
			'composer/formatting',
			'composer/controls',
		], function (formatting, controls) {
			if (formatting && controls) {
				formatting.addButtonDispatch('gif', function (textarea, selectionStart, selectionEnd) {
					Tenor.showModal(function (url, query, alt) {
						Tenor.select(textarea, selectionStart, selectionEnd, url, query, alt);
					});
				});
			}
		});
	};

	Tenor.initRedactor = function () {
		$.Redactor.prototype['tenor-gif'] = function () {
			return {
				init: function () {
					var self = this;
					var button = self.button.add('tenor-gif', 'Insert GIF');
					self.button.setIcon(button, '<i class="fa fa-tenor-gif"></i>');
					self.button.addCallback(button, self['tenor-gif'].onClick);
				},
				onClick: function () {
					var self = this;
					Tenor.showModal(function (url, query) {
						var code = self.code.get();
						code += '<p><img src="' + url + '" alt="' + query + '" /></p>';

						self.code.set(code);
					});
				},
			};
		};
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

	Tenor.showModal = function (callback) {
		require(['translator', 'benchpress'], function (translator, Benchpress) {
			Benchpress.parse('plugins/tenor-gif/modal', {}, function (html) {
				var modal = bootbox.dialog({
					title: 'Insert GIF',
					message: html,
					className: 'tenor-gif-modal',
					onEscape: true,
				});

				var queryEl = modal.find('#gif-query');
				var resultsEl = modal.find('#gif-results');
				var queryTimeout;

				modal.on('shown.bs.modal', function () {
					queryEl.focus();
				});

				queryEl.on('keyup', function () {
					if (queryTimeout) {
						clearTimeout(queryTimeout);
					}

					queryTimeout = setTimeout(function () {
						socket.emit('plugins.tenor-gif.query', {
							query: queryEl.val(),
						}, function (err, gifs) {
							if (err) {
								return translator.translate(err.message, function (translated) {
									resultsEl.addClass('alert alert-warning').text(translated);
								});
							}

							Tenor.populateDOM(resultsEl, gifs);
						});
					}, 250);
				});

				resultsEl.on('click', 'img[data-url]', function () {
					callback(this.getAttribute('data-url'), queryEl.val(), this.getAttribute('alt'));
					modal.modal('hide');
				});

				// Start with empty query
				queryEl.trigger('keyup');
			});
		});
	};

	Tenor.select = function (textarea, selectionStart, selectionEnd, url, query, alt) {
		require([
			'composer/formatting',
			'composer/controls',
		], function (formatting, controls) {
			if (selectionStart === selectionEnd) {
				controls.insertIntoTextarea(textarea, '![' + alt + '](' + url + ')');
				controls.updateTextareaSelection(
					textarea, selectionStart + alt.length + 4, selectionEnd + alt.length + url.length + 4
				);
			} else {
				var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '![', '](' + url + ')');
				controls.updateTextareaSelection(
					textarea, selectionEnd + 4 - wrapDelta[1], selectionEnd + url.length + 4 - wrapDelta[1]
				);
			}
		});
	};
});
