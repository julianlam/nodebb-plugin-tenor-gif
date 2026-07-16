'use strict';

$(document).ready(function () {
	const Tenor = {};

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

	$(window).on('action:chat.loaded', (ev, container) => {
		const containerEl = $(container);
		const textarea = containerEl.find('[component="chat/input"]')[0];
		containerEl.find('[data-action="tenor-gif"]').on('click', () => {
			require([
				'composer/controls',
			], function (controls) {
				Tenor.showModal(function (url, query, alt) {
					const selectionStart = textarea.selectionStart;
					const selectionEnd = textarea.selectionEnd;
					if (selectionStart === selectionEnd) {
						controls.insertIntoTextarea(textarea, '![' + alt + '](' + url + ')');
					} else {
						const wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '![', '](' + url + ')');
						controls.updateTextareaSelection(
							textarea, selectionEnd + 4 - wrapDelta[1], selectionEnd + url.length + 4 - wrapDelta[1]
						);
					}
					containerEl.find('[component="chat/input"]').trigger('input');
				});
			});
		});
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
					const self = this;
					const button = self.button.add('tenor-gif', 'Insert GIF');
					self.button.setIcon(button, '<i class="fa fa-tenor-gif"></i>');
					self.button.addCallback(button, self['tenor-gif'].onClick);
				},
				onClick: function () {
					const self = this;
					Tenor.showModal(function (url, query) {
						let code = self.code.get();
						code += '<p><img src="' + url + '" alt="' + query + '" /></p>';

						self.code.set(code);
					});
				},
			};
		};
	};

	Tenor.populateDOM = function (resultsEl, gifs) {
		require(['benchpress'], function (Benchpress) {
			Benchpress.render('partials/tenor-gif/list', {
				gifs: gifs,
			}).then(function (html) {
				resultsEl.html(html);
			});
		});
	};

	Tenor.showModal = function (callback) {
		require(['benchpress', 'modals'], function (Benchpress, modals) {
			Benchpress.render('plugins/tenor-gif/modal', {}).then(async function (html) {
				const modal = await modals.dialog({
					title: 'Insert GIF',
					message: html,
					className: 'tenor-gif-modal',
					onEscape: true,
				});

				const queryEl = modal.find('#gif-query');
				const resultsEl = modal.find('#gif-results');

				modal.on('shown.bs.modal', function () {
					queryEl.focus();
				});

				resultsEl.on('wheel', (e) => {
					e.preventDefault();
					resultsEl.get(0).scrollBy({
						left: e.originalEvent.deltaY < 0 ? -50 : 50,
					});
				});

				queryEl.on('keyup', utils.debounce(function () {
					socket.emit('plugins.tenor-gif.query', {
						query: queryEl.val(),
					}, function (err, gifs) {
						if (err) {
							resultsEl.addClass('alert alert-warning').translateText(err.message);
						}

						Tenor.populateDOM(resultsEl, gifs);
					});
				}, 300));

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
				const wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '![', '](' + url + ')');
				controls.updateTextareaSelection(
					textarea, selectionEnd + 4 - wrapDelta[1], selectionEnd + url.length + 4 - wrapDelta[1]
				);
			}
		});
	};
});
