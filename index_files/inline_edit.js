(function($) {
	$.fn.inline_edit_link = function(custom_opts)
	{
		custom_opts = $.extend({}, custom_opts);

		if(!custom_opts.link) // Make own.
		{
			var id = $(this).attr('id');
			//console.log(this);
			var thing = id.replace(/^\w+_/, "").replace(/_\d+$/, "").underscore().humanize(true);
			// Requires MODEL_field, strips start to first '_', and remove ID if on end...
			// and translates FieldName to 'field name'
			custom_opts.link = "Add "+thing+"/Edit "+thing;
		}

		$(this).inline_edit(custom_opts);
	}

	$.fn.inline_edit = function(custom_opts)
	{
		var container = this;
		var container_id = $(container).attr('id');

		if($(container).hasClass('inline_edit')) { return; } // already done.

		var link = null;
		var link_id = container_id+"_editlink";

		custom_opts = $.extend({}, custom_opts);

		// If content happens to match placeholder, remove, so it can all function like 'add'
		if(custom_opts.placeholder && $(container).html().trim().toLowerCase() == custom_opts.placeholder.toLowerCase())
		{
			//console.log("BLANKED");
			$(container).html(''); // erase, not really a value
		}

		var className = custom_opts.class ? custom_opts.class : '';

		if("link" in custom_opts) // Can be blank for icon only...
		{
			$(container).addClass('link');
			//console.log("LINK="+custom_opts.link);
			custom_opts.event = 'link';
			link = $("<a id='"+link_id+"' href='javascript:void(0)' class='btn btn-xs btn-primary controls inline_edit_link "+className+"'><span class='glyphicon glyphicon-edit'></span><span class='text'></span></a>");
			if(custom_opts.button) // bool, button-style vs link
			{
				$(container).addClass('left'); // float button on right side
				$(link).addClass('marginleft15 button left'); 
			} else if(custom_opts.inline) // put on same line.
			{
				$(container).addClass('left');
				$(link).addClass('left marginleft15');
				$(link).after("<div class='clear'></div>");
			}

			if(custom_opts.after || custom_opts.a || custom_opts.inline == 'after')
			{
				$(this).after(link);
			} else { // assume before content block.
				$(this).before(link);
			}




			$(link).bind('click', function() {
				$(container).trigger(custom_opts.event);
			});

			$(link).bind('enable', function() {
				var has_value = $.trim(container.html());
				var link_title = custom_opts.link.split("/");
				var title = (typeof link_title == 'object') ? (has_value && link_title[1] ? link_title[1] : link_title[0]) : link_title;

				if(custom_opts.addclass)
				{
					if(!has_value)
					{
						$(container).addClass(custom_opts.addclass);
					} else {
						$(container).removeClass(custom_opts.addclass);
					}
				} else if (custom_opts.editclass) {
					if(!has_value)
					{
						$(container).addClass(custom_opts.editclass);
					} else {
						$(container).removeClass(custom_opts.editclass);
					}
				}

				if(title)
				{
					$(link).find('span.text').html("&nbsp;"+title);
				}
				$(link).show();
				//console.log("SHOWING...");
			});
			$(link).bind('disable', function() {
				$(link).hide();
			});
			$(link).trigger('enable'); // show correct text.

		}

		var model; 
		var id; 
		var field; 
		// OR guessed from element id
		//

		if(!$(this).size())
		{
			console.log("Cannot find "+container);
		}

		// GUESSTIMATE model, id and field from element id
		// Model_Field_id
		var tag_id = $(this).attr('id');
		//console.log(this);
		if(parts = tag_id.match(/^(\w+)_(\w+)_(\d+)$/))
		{
			model = parts[1];
			field = parts[2].underscore();
			id = parts[3];
		} else if(parts = tag_id.match(/^([\w.]+)_(\w+)$/)) {
			model = parts[1];
			field = parts[2].underscore();
		}
		if(!id)
		{
			id = $.meta('page_id');
		}

		//console.log(custom_opts);

		if(custom_opts.model) { model = custom_opts.model; } // REQD
		if(custom_opts.id) { id = custom_opts.id; } // REQD, record
		if(custom_opts.field) { field = custom_opts.field; } // REQD

		if(!model)
		{
			console.log("COULDN'T DETERMINE MODEL - either pass 'model' as option or rename '"+tag_id +"' to Model_Field_N");
			return;
		}
		if(!field)
		{
			console.log("COULDN'T DETERMINE FIELD - either pass 'field' as option or rename '"+tag_id +"' to Model_Field_N");
			return;
		}


		// plugin could be in field name, but also from URL!
		var plugin = custom_opts.plugin; // should be lowercase.
		if(pluginSplit = model.match(/^(.*)[.](.+)$/))
		{
			plugin = pluginSplit[1];
			model = pluginSplit[2];
		}
		var controller = custom_opts.controller ? custom_opts.controller : model.underscore().pluralize();
		////console.log("CONT="+controller);
		//console.log("MOD="+model.underscore().pluralize());
		var prefix = custom_opts.prefix ? custom_opts.prefix : $.meta('prefix');
		var default_plugin = $.meta('plugin');
		if(!plugin && default_plugin)
		{
			plugin = default_plugin; // get from url! might be innacurate if 
		}
		//console.log("PREF="+prefix+", PLUG="+plugin+", CONT="+controller+"/editable/, F="+field);
		var saveurl = (prefix?"/"+prefix:"")+(plugin?"/"+plugin:"")+"/"+controller+"/editable/"+field+"/"+(typeof id !== 'undefined' ? id : "");
		var loadurl = (prefix?"/"+prefix:"")+(plugin?"/"+plugin:"")+"/"+controller+"/edit_field/"+field+"/"+(typeof id !== 'undefined' ? id : "");
		// move everything to ajax forms, for more control...
		if(custom_opts.append)
		{
			saveurl += "/"+custom_opts.append;
		}
		var fieldName = "data["+model+"]["+field.underscore()+"]";
		var tagName = $(this).get(0).tagName;
		var fieldType = custom_opts.type ? custom_opts.type : 'text';
		//console.log(tagName);
		if(tagName == 'P' || $(container).hasClass('textarea'))
		{
			fieldType = 'autogrow';//'textarea'; // Otherwise, assume one-liner.
			// textarea is glitchy, one-liner or less crap. dunno.

			// Should always be  at least 5 lines
		}
		var classes = $(this).get(0).className;
		var opts = {
			loadurl: custom_opts.custom ? loadurl : null,
			name: fieldName,
			type: fieldType,
			// override by setting 'type', NOT 'fieldType'
			tooltip: !custom_opts.link?'Click to edit':'',
			placeholder: custom_opts.placeholder?custom_opts.placeholder:(!custom_opts.link?'Click to add content':""),
			submit: 'Save',
			cancel: 'Cancel',
			onblur: 'ignore',
			width: '95%',
			height: 'auto',
			cssclass: 'editable '+ (custom_opts.editor ? " tinymce" : ""),
			/*cssclass: 'inherit',*/ /* pass instead */
			indicator: "<img src='/images/waiting.gif'/> Saving...",
			data: function(value, settings) {
				/* converting <br> to newline */
				var retval = value.replace(/<br[\s\/]?>\n?/gi, '\n');
				return retval;
			},
			onsubmit: function() {
				$(container).addClass('enabled');
				if(typeof custom_opts.oncomplete === 'function')
				{
					custom_opts.oncomplete();
				}
			},
			onreset: function() {
				$(container).addClass('enabled');
				if(link) { link.show(); }

				if(typeof custom_opts.oncomplete === 'function')
				{
					custom_opts.oncomplete();
				}
			},
			callback: function() { // after replaced.
				//console.log("CALLED");
			}, 
			event: 'click',
		};
		//console.log(url);
		//console.log(opts);
		$.extend(opts, custom_opts);

		// Make sure callback always re-enables link.
		var callback2 = custom_opts.callback;
		opts.callback = function(response) { // if json, response is object; else, response is value
			if(typeof callback2 == 'function')
			{
				callback2(response);
			}
			if(link) 
			{
				link.trigger('enable');
			}
		};

		if(opts.type == 'textarea' || opts.type == 'autogrow') // put save/cancel on own line
		{
			opts.submit = "<br/><button type='submit' onClick='return false;'>"+opts.submit+"</button>";
		}

		//console.log(opts.placeholder);
		//console.log($(container).html().trim().toLowerCase());
		//

		if(opts.json)
		{
			// We have additional stuff.
			$(container).editable(function(value, settings) {
				var data = {};
				data[fieldName] = value;
				$.post(saveurl, data, function(response) {
					// store into field, since manual
					$(container).html(response[field]);
					$(container).removeClass('jeditable-placeholder');
					opts.callback(response);

				});
			}, opts);
		} else {
			$(container).editable(saveurl, opts);
		}

		// XXX DISABLE CLICK-ESCAPE TO CANCEL
		$(this).addClass('inline_edit enabled');

		$(container).bind('disable', function() {
			console.log("DISABLE");
			$(container).removeClass('enabled');// for css highlight hover
			$(container).editable('disable');
		});
		$(container).bind('enable', function() {
			console.log("container enable");
			$(container).addClass('enabled');
			$(container).editable('enable');
		});

		$(container).bind(opts.event, function() { 
			//  XXX TODO ADD TIP ETC HERE IF DESIRED ONCE READY TO EDIT...
			
			console.log(container);
			console.log($(container).find('textarea'));
			if(custom_opts.editor)
			{
				$(container).find(':input:first').addClass(custom_opts.editor === true ? "editor" : custom_opts.editor).editor();
			}
			
			if($(container).data('disabled.editable')) { return; } // ignore.

			$(container).removeClass('enabled'); 
			if(link)
			{
				$(link).trigger('disable');
			}
		});
	};

})(jQuery);
