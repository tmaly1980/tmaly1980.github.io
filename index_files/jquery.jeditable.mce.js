(function($) {
$.editable.addInputType('mce', {
	element: function(settings, original) {
		var textarea = $('<textarea id="'+$(original).attr("id")+'_mce"/>');
		if(settings.rows)
		{
			textarea.attr('rows',settings.rows);
		} else {
			textarea.height(settings.height);
		}
		if(settings.cols)
		{
			textarea.attr('cols',settings.cols);
		} else {
			textarea.width(settings.width);
		}

		$(this).append(textarea);
		return  textarea;
	},
	plugin: function(settings,original) {
		$('textarea',this).editor();
	},
	submit: function(settings,original) {
		//console.log(tinyMCE);
		//tinymce.remove($('textarea',this));
		tinymce.remove('textarea');
		//tinyMCE.triggerSave();
		//tinyMCE.execCommand("mceRemoveControl", true, $(original).attr("id")+'_mce');
	},
	reset: function(settings,original) {
		//console.log(tinymce);
		//console.log($('textarea',this));
		//tinymce.remove($('textarea',this));
		tinymce.remove('textarea');
		//tinyMCE.execCommand("mceRemoveControl", true, $(original).attr("id")+'_mce');
		original.reset(this);
	},
});

})(jQuery);
