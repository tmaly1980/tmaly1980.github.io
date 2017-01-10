(function($) {
	$(document).ready(function() {
		$('body').on('click', 'a.disabled', function(e) {
			e.preventDefault();
			return false;
		});
	});
	// This should be delayed, based upon 'rearrange' button.
	// so users don't accidentally do or feel awkward.
	//
	//
	$.fn.sorter = function(targets, options) // Call directly if just once
	{
		return $(this).sortInit(targets,options).sortEnable();
	};

	$.fn.sorterStart = function(targets, options)
	{
		return $(this).sortInit(targets,options).sortStart();
	};


	$.fn.sorted = function(options)
	{
		var itemswrapper = this;

		if(options.msg) { $(options.msg).hide(); }

		var itemsel = options.items ? options.items : '> div, > li, > tbody';// Works with divs or lists or table bodies.
		$(itemswrapper).removeClass('sorting').sortable('destroy');
		$(itemswrapper).find('.sortablehide, .hidesortable').show();
		var items = $(itemswrapper).find(itemsel);

		$(itemswrapper).find('a.disabled').removeClass('disabled');
		$(itemswrapper).find('.btn').show();
	};

	$.fn.sorting = function(options) // turns on sorting for a container list
	{
		var itemswrapper = this;
		var controller = options.controller ? options.controller : $.meta('controller');
		var prefix = options.prefix ? options.prefix : $.meta('prefix');
		var action = options.action ? options.action : "sort"; // could be banner_sort, etc.
		var plugin = options.plugin ? options.plugin : $.meta('plugin');

		var itemsel = options.items ? options.items : '> div, > li, > tbody';// Works with divs or lists or table bodies.

		$(itemswrapper).find('.sortablehide, .hidesortable').hide();

		if(options.msg) { $(options.msg).show(); }

		var defaults = {
			axis: 'y', // vertical list only, default, otherwise for grids, pass axis: 'both'.
			items: itemsel,
			connectWith: itemswrapper, // Could be others if we pass '.Links', ie mult categories.
			cursor: 'move',
			/* bugfix for jumping sorts when page scrolled */
			sort: function(event, ui) {
				//console.log(ui.position.top + " + " + $(window).scrollTop());
				//ui.helper.css({'top' : ui.position.top + $(window).scrollTop() + 'px'});
				
        			var $target = $(event.target);
        			if (!/html|body/i.test($target.offsetParent()[0].tagName)) {
            				var top = event.pageY - $target.offsetParent().offset().top - (ui.helper.outerHeight(true) / 2);
					//console.log($target.offsetParent());
					//console.log("PageY="+event.pageY+", PARENT OFFSET="+$target.offsetParent().offset().top+", p2="+$target.parent().offset().top+", HEIGHT="+(ui.helper.outerHeight(true)/2));
            				ui.helper.css({'top' : top + 'px'});
        			}
			},
			/* end bugfix */
			update: function(event, ui) {
				var url = (prefix?"/"+prefix:"")+(plugin?"/"+plugin : "")+"/"+controller+"/"+action;
				var container_id = $(this).attr('id');
				var container = this;
				if(container_id && (matches = container_id.match(/_(\d+)$/)))
				{
					var group_id = matches[1];
					url += "/"+group_id;
				}
				// XXX NOTHING SERIALIZED...
				var data = $(this).sortable("serialize");
				//console.log(url);
				//console.log(data);

				$.post(url, data, function(response) {
					if(typeof options.callback == 'function')
					{
						options.callback(container, response); // may send html, json, etc back sometimes.
					}
				});
			}
		};

		options = $.extend(defaults, options); // individual override.

		///console.log(options);

		// ONLY bother sorting on a list with MORE than one entry...
		$(itemswrapper).addClass('sorting');

		$(itemswrapper).find(itemsel).each(function() {
			var item = this;
			$(item).find('a').not('.btn').addClass('disabled');
			$(item).find('.btn, .controls').hide();
			//$(item).prepend("<span class='glyphicon glyphicon-resize-vertical'></span>");
		});

		$(itemswrapper).sortable(options);
	};

	$.fn.sortInit = function(targets, options) // call multiple times to have links/categories sortable via same control button, simultaneously
	// Then call sortable() after!!
	{
		options = $.extend({}, options);
		var button = this;
		var label = $(button).find('span').not('.glyphicon, .fa');

		/// KEEP SYNTAX THE SAME AT PAGE LEVEL - adjust internally.

		$(button).bind('sorting', function() {
			$(targets).sorting(options);
		});
		$(button).bind('sorted', function() { // done.
			$(targets).sorted(options);
		});

		///////////////////////
		//
		return button;
	};

	$.fn.sortStart = function() {
		return $(this).trigger('sorting');
	};

	$.fn.sortFinish = function() {
		return $(this).trigger('sorted');
	};

	$.fn.sortEnable = function() { // Enables sortable button.
		var button = this;
		var label = $(button).find('span').not('.glyphicon, .fa');
		$(button).on('click', function() { // one time registration
			var labeltext = $(label).text();

			if(labeltext.match(/Done/)) // Alread enabled
			{
				label.html(label.data('label'));

				$(button).sortFinish();//trigger('sorted');
			} else {
				label.data('label', labeltext); // store for later.
				label.html('Done');

				$(button).sortStart();//trigger('sorting');
			}
		});
		return button;
	};
	


})(jQuery);
