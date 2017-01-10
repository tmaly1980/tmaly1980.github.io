(function($) {
	$.boo = function() { console.log("BOO!"); };


	$.fn.scrollTo = function()
	{
		var target = this;
        	$('html,body').animate({ scrollTop: target.offset().top }, 500);
	};

	$.fn.getoptions = function() { // we MUST store as hashes in arrays because some browsers will rearrange keys to a numeric order if numeric
		var dropdown = this;
		var optionlist = $(dropdown).find('option');
		var options = [];
		$.each(optionlist, function(i,opt) {
			var key = $(opt).attr('value');
			var text = $(opt).text();
			options.push({value: key, text: text});
		});

		return options;
	};
	$.fn.setoptions = function(options,selected,defaultValue,emptyValue) { // populate select list with programmable options
		var dropdown = this;
		if(!selected) { selected = $(dropdown).val(); } // can be explicit too...
		if(!selected && defaultValue) { selected = defaultValue; } // 
		$(dropdown).empty();
		if(emptyValue) { 
			$(dropdown).append($("<option value=''></option>").text(emptyValue));
		}
		if(!options) { return; }
		$.each(options, function(k,v) {
			$(dropdown).append(
				$("<option></option>").attr('value',k).text(v)
			);
		});
 		if(selected) { $(dropdown).val(selected); } // Preserve if still valid. 

		return dropdown;
	};



	$.fn.tagselect = function(custom_params)
	{
		var default_params = {
			selectText: "Select from list",

		};

		var params = $.extend(true,{},default_params,custom_params);

		var select = this;
		var options = $(select).getoptions();
		var id = $(select).attr('id');

		var container = $("<div class='tagselect-container'></div>"); // Storing values selected (tags/buttons)

		var controls = $("<div class='btn-group tagselect'></div>");
		var button = $("<button type='button' class='btn btn-primary btn-text' data-toggle='dropdown'>"+params.selectText+"</button>");
		var icon = $("<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span></button>");
		var ul = $("<ul class='dropdown-menu ' role='menu'></ul>");

		controls.append(button);
		controls.append(icon);
		controls.append(ul);
		
		for(var i in options)
		{
			ul.append("<li data-value='"+options[i].value+"'><a href='#'>"+options[i].text+"</a></option>");
		}

		$(select).after(controls);
		$(select).after(container);
		$(select).hide();

		// Intercept 'focus' to at least go to area.
		$(select).bind('focus', function(e) {
			$('html,body').animate({ scrollTop: $(select).parent().offset().top }, 500);
		});

		// Add item.
		$(ul).on('click', 'li a', function(e) {
			e.preventDefault();
			var link = this;

			var parent = $(link).parent();

			$(parent).hide(); // "remove" from list

			var value = $(parent).data('value');
			var text = $(link).text();

			// add to underlying select
			var values = $(select).val();
			if(!values) { values = []; }
			values.push(value);
			$(select).val(values).change();

			// add to destination container
			var valueButton = $("<button type='button' title='Remove item' class='btn btn-default' data-value='"+value+"'>"+text+" <span class='glyphicon glyphicon-remove'></span></button>");
			$(container).append(valueButton);
		});

		
		// Remove container items.
		$(container).on('click', 'button', function(e) {
			e.preventDefault();

			var button = this;
			var value = $(button).data('value');
			
			// "Add" option back to list
			$(ul).find('li[data-value='+value+']').show();

			// Remove self.
			$(button).remove();
			
			// Clear from underlying select
			var values = $(select).val();
			var valuesout = [];
			for(var n in values)
			{
				if(values[n] != value) { valuesout[n] = values[n]; }
			}
			$(select).val(valuesout).change();
		});

		$(document).ready(function() {
			// pre-load list.
			var values = $(select).val();
			if(values && values.length) { 
				$.each(values, function(i,value) {
					$(ul).find('li[data-value='+value+']').hide();
					var text = $(select).find("option[value="+value+"]").text();
					var valueButton = $("<button type='button' title='Remove item' class='btn btn-default' data-value='"+value+"'>"+text+" <span class='glyphicon glyphicon-remove'></span></button>");
					$(container).append(valueButton);
				});

			}
		});

		return select;
	};

	$.loading = function(enable) 
	{
		$('body').loading(enable);
	};

	// XXX RETROFIT TO WORK WITH INPUTS, act like bootstrap validator

	$.fn.loading = function(enable)
	{
		var target = this;
		if($(target).is("input,textarea"))
		{
			var parent = $(target).parent().addClass('has-feedback');
			var loader = parent.find('.form-control-feedback');
			if(!loader.length)
			{
				loader = $("<i class='form-control-feedback glyphicon glyphicon-cog spinner'></i>");
				$(target).after(loader);
			}
		} else {
			var loader = $(target).find('.loading');
			if(!loader.length)
			{
				loader = $("<div class='loading jumbotron jumbotron-icon'><div class='background'></div><button class='btn btn-primary'><i class='fa fa-spinner fa-spin'></i></div></div>");
				$(target).append(loader);
				loader.find('button').click(function()
				{
					loader.hide();
				});
			}
		}
		// do we append to container? wirth abs position?
		if(enable !== false) // enable
		{
			loader.show();
		} else { // disable
			loader.hide();
		}
	};

	$.meta = function(key) // Storing url attribs in the meta.
	{
		return $('meta[name='+key+']').prop('content');
	};

	$.fn.delaySubmit = function(callback, timeout)
	{
		var form = this;
		$(form).find(':input').each(function() {
			$(this).changeup(callback, timeout);
		});
	};

	$.fn.autoprepend = function(prefix) {
		$(this).changeup(function(field) {
			var val = $(field).val();
			if(!val.match(new RegExp(prefix)))
			{
				$(field).val(prefix+val);
			}
		});
	};

	// Field object gets passed as PARAMETER to callback, not 'this'
        $.fn.changeup = function(callback, timeout) {
		// XXX for setTimeout trigger, 'this' seems to refer to window, so we must pass field!="+$(field).data('keyup_timeout_id'));
		var field = this;

		var timeout_key = $(this).data('timeout_key') ? $(this).data('timeout_key') : 'keyup_timeout_id_'+parseInt(Math.random()*999999);
		var value_key = timeout_key+"_value";
		var handled_key = timeout_key+"_handled";

		// need random so we can have multiple changeup()

		if(!timeout) { timeout = 500; }
		// seems that delete/backspace stop registering as a 'keypress' - so we must use keyup
		//console.log("F="+$(field).attr('id'));
		//console.log("TK #"+$(field).attr('id')+"="+timeout_key+" AFTER "+timeout);

		// START FRESH.

		$(field).keyup(function(e) {
			// if nonchar, ignore.
			if($.nonChar(e)) { return; }

			f = this;

			// if value didnt change, ignore.
			var saved = $(f).data(value_key);
			if(saved && saved == $(f).val()) { return; }

			// Else, store and then start timer.
			$(f).data(value_key, $(f).val());

			//console.log("STARTING TIMER="+$(f).attr('id'));

			var existing_timer = $(f).data(timeout_key);
			if(existing_timer) // give us some more time.
			{
				//console.log("CLEARING EXISTING="+existing_timer);
				clearTimeout(existing_timer);
				$(f).data(timeout_key, null);
			}

			// Reinitialize timer.
			var new_timer = setTimeout(function() {
				//console.log("EXECUTING CALLBACK");
				$(f).data(handled_key, true);
				callback($(f)); // passing field.
			}, timeout);

			$(f).data(timeout_key, new_timer);
		});

		// If they keep key down, dont trigger anything until next key up
		$(field).keydown(function(e) {
			// if nonchar, ignore.
			if($.nonChar(e)) { return; }

			f = this;

			var existing_timer = $(f).data(timeout_key);
			if(existing_timer)
			{
				clearTimeout(existing_timer);
				// cancel previous timers until next keyup, which will create a new one.
				$(f).data(timeout_key, null);
			}
			$(f).data(handled_key, null); // NOT handled yet.
		});

		// ALSO have a 'change' one so we occur IMMEDIATELY if they lose focus.
		$(field).bind('change paste', function() {
			f = this;
			//console.log("CHANGE="+$(f).attr('id'));
			//
			
			if($(f).data(handled_key)) { // already dealt with.
				return;
			}

			// store value
			$(f).data(value_key, $(f).val()); // so keyup knows if changed or not

			// Throw away timers since we're doing it now.

			var existing_timer = $(f).data(timeout_key);
			if(existing_timer) // give us some more time.
			{
				//console.log("CLEARING EXISTING="+existing_timer);
				clearTimeout(existing_timer);
				$(f).data(timeout_key, null);
			}

			// Execute immediately!

			callback($(f)); // passing field.
		});
        };

	$.nonChar = function(e)
	{
		return ((e.which < 32 || e.which > 127) && e.which != 8); // Not valid input char.
	};
	$.eventChar = function(e)
	{
		// Should use with keypress(), NOT keydown(), to get proper lowercase vs uppercase
		return $.nonChar(e) ? null : String.fromCharCode(e.which);
	};

	$.fn.warnDirtyUnload = function(msg) // all modified forms
	{

		var form = this;
		j(document).ready(function() { // wait for js things to fill in defaults if any
			j(form).data('serialized-orig', j(form).serialize());
		});

		var fields = j(form).find('input, textarea, select');

		fields.changeup(function() {
			j(form).trigger('checkDirty');
		});
		j(form).bind('checkDirty', function() {
			var serialized = j(form).serialize();
			var serialized_orig = j(form).data('serialized-orig');

			var dirty = (serialized != serialized_orig);
			j(form).data('dirty', dirty);
			// so can undo changes and not be yelled at.
			j(form).trigger('dirty', [dirty]); // so can deal with, ie show warnings, save buttons, etc.
			
		});
		j(form).submit(function() {
			j(form).data('dirty', false); // Submitting is ok
		});

		j(form).find('a.cancel').click(function() {
			j(form).data('dirty', false); // ignore dirty page if they really want to cancel
		});

		if(msg !== false)
		{
			window.onbeforeunload = function () {
				if(j(form).data('dirty'))
				{
					if(!msg)
					{
						msg = 'Leaving this page will lose all unsaved changes.';
					}
					return msg;
				}
			};
		}
	};

	String.prototype.ucwords = function() // yay!
	{
		var str = this;
		return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
			return $1.toUpperCase();
		});
	};

	// Wrap 'html', 'remove' and 'append' so we trigger an event on the parent container
	$.fn.smartRemove = function() { // called on child.
		var parent = $(this).parent(); // get before gone.
		rc = $(this).remove();
		parent.trigger('updatedChildren');

		// also toggle nodata ON if no children left.
		if(!parent.children().not('.clear, .nodata').size())
		{
			$(parent).find('.nodata').show();
		}
		return rc;
	};

	$.fn.addHelp = function(container) { // info icon next to label
		var input = this;
		var id = $(input).attr('id');
		var label = $("label[for="+id+"]");
		var where = label.size() ? label : input;

		var info = $("<a id='"+id+"_help' class='right' href='javascript:void(0)'></a>");
		info.html("<span class='medium blue glyphicon glyphicon-info-sign'></span>");
		$(where).after(info);

		$(info).click(function() { $(container).toggle(); });

		$(document).ready(function() {
			$(container).addClass('alert alert-info').hide();
		});
	};

	// Call this function AT MOST once every TIMEOUT interval
	// ie good for form submissions
	$.fn.delayTrigger = function(callback, timeout)
	{
		var f = this;
		var timeout_key = $(this).data('timeout_key') ? $(this).data('timeout_key') : 'keyup_timeout_id';
		var value_key = timeout_key+"_value";
		var handled_key = timeout_key+"_handled";

		if(!timeout) { timeout = 500; }

		var existing_timer = $(f).data(timeout_key);
		if(existing_timer) // give us some more time.
		{
			//console.log("CLEARING EXISTING="+existing_timer);
			clearTimeout(existing_timer); // Remove previous calls waiting
			$(f).data(timeout_key, null);
		}

		// Reinitialize timer.
		var new_timer = setTimeout(function() {
			//console.log("EXECUTING CALLBACK");
			$(f).data(handled_key, true);
			callback($(f)); // passing field.
		}, timeout);

		$(f).data(timeout_key, new_timer);

	};

	$.fn.autofit_nav = function()
	{
		//console.log("autofit nav");
		var nav = this;
		var minFontsize = 10; // px
		var minMargin = 5;
		var minPadding = 5;
		var navitem = $(nav).children('li');
		var lastnavitem = $(nav).children('li:last');
		var firstnavitem = $(nav).children('li:first');

		if(!$(nav).size() || !$(lastnavitem).size() || !$(firstnavitem).size()) { return; } // irrelevant

		// XXX TODO not sure why 2nd row items  show wrong 'top' initially
		// call  by adding artifical  delay to avoid issue

		//$(navitem).each(function() {
			//console.log($(this).offset());
		//});

		//console.log(firstnavitem.offset());
		//console.log(lastnavitem.offset());
		//console.log("LN="+$(lastnavitem).offset().top +",FN="+$(firstnavitem).offset().top);
		while($(lastnavitem).offset().top > $(firstnavitem).offset().top)
		{ // Last item  is on different line
			//console.log("TOO BIG, shrinking");
			//console.log("NH="+$(nav).height()+", NIO="+(2*$(navitem).outerHeight(true)));

			// First try to adjust LI margin.
			if(parseInt($(navitem).css('margin-left')) > minMargin)
			{
				//console.log("shrinking margin...");
				$(navitem).css('margin-left', (parseInt($(navitem).css('margin-left')) - 0.5)+"px");
				$(navitem).css('margin-right', (parseInt($(navitem).css('margin-right')) - 0.5)+"px");
				
			} else if (parseInt($(navitem).css('padding-left')) > minPadding) { 
			// Then try adjusting LI padding
				//console.log("shrinking padding...");
				$(navitem).css('padding-left', (parseInt($(navitem).css('padding-left')) - 0.5)+"px");
				$(navitem).css('padding-right', (parseInt($(navitem).css('padding-right')) - 0.5)+"px");
			
			} else if (parseInt($(navitem).css('font-size')) > minFontsize) { 
			// Then try adjusting font-size
				//console.log("shrinking font-size...");
				$(navitem).css('font-size', (parseInt($(navitem).css('font-size')) - 0.5)+"px");
			} else {
				//console.log("giving up...");
				break; // cant make  any more adjustments
			}
		}

		//console.log("LN="+$(lastnavitem).offset().top +",FN="+$(firstnavitem).offset().top);
	};

	// Add a duplicate form fields row/block to multi-input form
	$.fn.appendFormRow = function(src) {
		var container = this;
		var cloneIndex = $(container).find(src).length;
		var row = $(container).find(src).last().clone();
		row.find(':input').each(function() {
			$(this).val('');
			this.id = this.id.replace(/^(\d+)/, cloneIndex);// 0.Model.fieldName
			this.name = this.name.replace(/^data\[(\d+)\]/, "data["+cloneIndex+"]");
		});
		row.appendTo(container);
		return row;
	};

	$.fn.addFormRow = function(preserveValue) { // Adds row of same values (blank or minor mods) immediately after
		var srcRow = this;
		var row = $(srcRow).clone();
		var cloneIndex = $(srcRow).siblings().length;
		row.find(':input').each(function() {
			// this needs to be adjusted for different things.... ie data[name][n] also
			this.id = this.id.replace(/(\d+)/, cloneIndex);// 0ModelFieldName or Model0FieldName
			this.name = this.name.replace(/\[(\d+)\]/, "["+cloneIndex+"]");
			if(!preserveValue) { 
				$(this).val(''); // Leave empty. 
			}
		});
		row.insertAfter(srcRow);
		return row;
	};

	$.fn.tabloader = function() /* called  on .nav-tabs  automatically */
	{
		var tabs = this;
		$(window).hashchange(function() {
			var hash = location.hash;
			var labels = $(tabs).find('a');
			$(labels).each(function(index) {
				var that = $(this);
				var li = $(this).parent();
				var href = that.attr('href');
				if(href === hash || (!hash && index == 0)) // First by default.
				{
					$(li).addClass('active');
					$(href).addClass('active');
				} else {
					$(li).removeClass('active');
					$(href).removeClass('active');
				}
			});
		});
		$(window).hashchange();
	};

})(jQuery);
