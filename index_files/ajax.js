(function($) {
	// DIALOGS/MODALS

	// New BootstrapDialog stuff... only one instance, saved to #modal (so can tweak from inside) - otherwise directly call BootstrapDialog.alert() etc
	$.dialog = function(url, title, customOpts)
	{
		var defaults = {id: 'modal',
			closable: true,
			title: title,
			//message: content,
			onshow: function(dialog) {
				if(customOpts && customOpts.header === 0) // should pass in link so dont get a flicker of the default header.
				{
					dialog.getModalHeader().hide();
				}
			}
		};
		var opts = $.extend(defaults, customOpts);

		var content = $("<div></div>");
		$.ajax({
			url: url,
			data: opts.data,
			type: opts.data ? "POST" : "GET",
			beforeSend: function(xhr) { if(opts.update) { xhr.setRequestHeader("X-Update", opts.update); } },
			success: function(response) { 
				opts.message = $(response).wrap("<div></div>");
				BootstrapDialog.show(opts);
			}
		});

	};
	$.dialogtype = function(type)
	{
		$.getDialog('modal').setType(type);
	};
	$.dialogheaderhide = function()
	{
		$.getDialog('modal').getModalHeader().hide();
	};

	$.dialogheaderbuttons = function(buttons)
	{
		var dialog = $.getDialog('modal')
		var header = dialog.getModalHeader();

		var closeButton = header.find('.bootstrap-dialog-close-button').remove(); // Remove event click handler too
		var $container = $('<div></div>'); // without event handler.
		$container.addClass(dialog.getNamespace('close-button'));

		if(buttons !== false) { // false == blank
			if(!buttons instanceof Array)
			{
				buttons = [buttons];
			}
			for(var i in buttons)
			{
				$container.append(buttons[i] + " &nbsp; ");
			}
		}

		header.prepend($container);
	};

	$.getDialog = function(id)
	{
		if(!id) { id = 'modal'; }
		return BootstrapDialog.dialogs[id];
	};
	$.getDialogModal = function(id)
	{
		var dialog = $.getDialog(id);
		return dialog ? dialog.getModal() : null;
	}

	$.dialogtitle = function(title)
	{
		$.getDialog('modal').setTitle(title);
	};
	$.dialogbuttons = function(buttons)
	{
		var buttonsOut = [];
		for(var i in buttons)
		{
			var button = buttons[i];
			if(typeof button == 'string')
			{
				// common buttons, declared by name
				if(button == 'cancel')
				{
					button = {
						label: "<span class='glyphicon glyphicon-remove'></span> Cancel",
						cssClass: 'btn-danger',
						action: function(dialog) {
							dialog.close();
						}
					};
				} else if (button == 'save') {
					button = {
						label: "Save <span class='glyphicon glyphicon-chevron-right'></span>",
						cssClass: 'btn-primary',
						action: function(dialog) {
							$(dialog).getModal().find('form').submit();
						}
					};
				} else if (button == 'close') {
					button = {
						label: "<span class='glyphicon glyphicon-remove'></span> Close",
						cssClass: 'btn-primary',
						action: function(dialog) {
							dialog.close();
						}
					};
				}
			}
			buttonsOut[buttonsOut.length] = button;
		}
		$.getDialog('modal').setButtons(buttonsOut).getModalFooter().show();
	};
	$.dialogclose = function()
	{
		$.getDialog('modal').close();
	};

	///////////////////////

	$.ajaxResponse = function(response, options, src) {

		var update = options.update ? options.update : null;
		var replace = options.replace ? options.replace : null;
		var append = options.append ? options.append : null;

		var modal = $.getDialogModal();

		if(typeof response == 'object') { // Json
			// Handle error code
			if(response.error)
			{
				if($(src).is('form')) {
					$(src).find('div.flashMessage.alert').remove(); // Remove old errors.
					$(src).prepend("<div class='flashMessage alert alert-danger'>"+response.error+"</div>");
				} else { // Link
					$(src).parent().find('div.flashMessage.alert').remove(); // Remove old errors.
					$(src).after("<div class='flashMessage alert alert-danger'>"+response.error+"</div>");
				}

				// May have specifics to validation
				if(response.validationErrors)
				{
					for(var model in response.validationErrors)
					{
						var data = response.validationErrors[model];
						if(typeof data == 'object')
						{
							for(var fieldKey in data)
							{
								var message = data[fieldKey];
								if(typeof message == 'object' && !(message instanceof Array)) // This is a relation, ie belongsTo.
								{
									var relModel = fieldKey;
									var relData = message;
									for(var relFieldKey in relData)
									{
										var relMessage = relData[relFieldKey];
										var field = "*[name=data\\["+relModel+"\\]\\["+relFieldKey+"\\]]";
										var model_field = (relModel+"_"+relFieldKey).replace(/\W+/, "_").toLowerCase();
										var div = $(src).find(field).closest('div').addClass('error');
										div.find('.error-message').remove();
										div.append("<div class='"+model_field+" error-message'>"+relMessage+"</div>");
									}
								} else {
									var field = "*[name=data\\["+model+"\\]\\["+fieldKey+"\\]]";
									var model_field = (model+"_"+fieldKey).replace(/\W+/, "_").toLowerCase();

									if(message instanceof Array)
									{
										message = message.join(". ");
									}

									var div = $(src).find(field).closest('div').addClass('error');
									div.find('.error-message').remove();
									div.append("<div class='"+model_field+" error-message'>"+message+"</div>");
								}
							}
						} else { // value
							var fieldName = "data\\["+model+"\\]";
							var message = data;
							$(src).find("*[name="+fieldName+"]").append("<div class='error-message'>"+message+"</div>");
						}
					}
				}
			} else {
				// script may tell us where it wants to update (from modal form to page container)
				if(response.update)
				{
					update = response.update;
				}
				if(response.target)
				{
					update = response.target;
				}
				if(response.append)
				{
					append = response.append;
				}
				if(response.replace)
				{
					replace = response.replace;
				}

				if(response.content)
				{

					// Figure out WHERE to put response
					if(!update && modal.size())
					{
						update = modal.find('.modal-body');
					}
					content = $($.parseHTML(response.content, document, true)); // wrap plain text.

					if(update == 'modal' && modal.size())
					{
						update = modal.find('.modal-body');
					} else if (typeof update == 'string') {
						update = '#'+update;
					} // else, already object.

					if(append) // pass append=>true to add to end of list, vs replace, with one item.
					{
						if(append === true)
						{
							$(update).append(content);
						} else { 
							if(typeof append == 'string') { append = '#'+append; }
							$(append).append(content);
						}
					} else if(replace) { // Remove outer container in target, esp when new content already contains
						if(replace === true)
						{
							$(update).replaceWith(content);
						} else {
							if(typeof replace == 'string') { replace = '#'+replace; }
							$(replace).replaceWith(content);
						}
					} else {
						$(update).html(content);
					}
				}

				if(response.script)
				{
					eval(response.script);
				}

				// Handle modal close
				if(response.modalclose || (modal && modal.size() && update != 'modal' && !modal.find(update).size()))
				{
					$.dialogclose();
				}

				if(response.redirect)
				{
					window.location.replace(response.redirect);
				}
			}

		} else if(response) { // actual content
			content = $(response);

			if(update == 'modal' && modal.size())
			{
				update = modal.find('.modal-body');
			} else if (typeof update == 'string') {
				update = '#'+update;
			}

			if(append) // pass append=>true to add to end of list, vs replace, with one item.
			{
				if(append === true)
				{
					//j('#'+update).append(content);
					$(update).append(content);
				} else { 
					//j('#'+response.append).append(content);
					if(typeof append == 'string') { append = '#'+append; }
					$(append).append(content);
				}
			} else if(replace) { // Remove outer container in target, esp when new content already contains
				if(replace === true)
				{
					$(update).replaceWith(content);
				} else {
					if(typeof replace == 'string') { replace = '#'+replace; }
					$(replace).replaceWith(content);
				}
			} else {
				$(update).html(content);
			}

			if((modal && modal.size() && update && update != 'modal' && !modal.find(update).size()))
			{
				$.dialogclose();
			}
		}

		return typeof response == 'object' ? !response.error : response;
	};

	// OBSOLETE, should be using ajax calls directly so no traces of headers
	/*
	$.setAjaxHeaders = $.setAjaxHeader = $.ajaxSetHeaders = function(headers) // set/clear
	{
		console.log("SETTING HEADERS=");
		console.log(headers);
		headers = $.extend({}, headers); // reset by passing nothing.
		$.ajaxSetup({ headers: headers});
	};
	*/

	$(document).ready(function()
	{
		$('body').on('click', 'a.json, a.ajax, a[data-update]', function(e) {
			var src = this;
			e.preventDefault();
			var url = $(src).attr('href');
			var options = $(src).data();
			if($(src).data('form')) // Also post some content from form...
			{
				var form = $(src).closest('form');
				options = $.extend(options, $(form).serializeObject());
			}

			$.ajax({
				url: url,
				data: options,
				type: "POST",
				beforeSend: function(xhr) { if(options.update) { xhr.setRequestHeader("X-Update", options.update); } },
				success: function(response) { 
					$.ajaxResponse(response, options, src);
				}
			});

		});

		$('body').on('submit', 'form.json, form.ajax, form[data-update]', function(e) {
			var form = $(e.target);
			if($(form).hasClass('bv-form')) {return; } // handled in validator instead.
			e.preventDefault();
			$(form).trigger('ajaxSubmit');
		});

		// May be called from validator...
		$('body').on('ajaxSubmit', 'form.json, form.ajax', function(e) {
			var form = $(this);

			// Pass on thru ajax handler.
			var opts = $(form).data();
			if($(form).hasClass('json')) { opts.json = true; }
			// ONLY json will be allowed - attempts at HTML will
			// force Cake to render via JsonView (/Views/Foo/json/*.ctp)

			///console.log("SUBMIT");
			///console.log(e);
			// XXX CALLED TWICE, ONCE FROM BOOTSTRAP VALIDATOR ***

			$(form).ajaxSubmit({
				dataType: opts.json ? 'json' : null,
				beforeSend: function(xhr) { if(opts.update) { xhr.setRequestHeader("X-Update", opts.update); } },
				success: function(response) { 
					$.ajaxResponse(response, opts, form);
				}
			
			}); // Handles file uploads, too
			return false; // Prevent default (requires caller says 'return ajax_submit')
		});

		$('body').on('click', '.dialog', function(e) {
			e.preventDefault();

			var link = this;
			var url = $(link).attr('href');

			var opts = $(link).data(); // can pass params...

			if($(link).hasClass('post'))
			{
				opts.data = $(link).closest('form').serializeObject();
			}

			var title = $(link).attr('title');
			if(!title)
			{
				title = $(link).text(); // link label itself.
			}

			$.dialog(url, title, opts);

			return false;
		});
	});

})(jQuery);
