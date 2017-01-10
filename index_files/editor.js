(function($) { 
	$.fn.editor = function() {
		var editor = this;
		var mediaonly = $(editor).hasClass('mediaonly'); // For tickets and such.
		$(editor).tinymce({
			menubar: false,
			//theme: 'advanced',
			relative_urls: false,
			force_p_newlines: false,
			force_br_newlines: true,
			toolbar: mediaonly ? 
				"link hpimage media" :
				"styleselect removeformat | bold italic | alignleft aligncenter alignright | bullist numlist | table | link hpimage media | code",

			plugins: "paste link image autolink hpimage autoresize table media code",
			autoresize_max_height: 400,
			content_css: "/core/css/fonts.css",
			link_title: false,
			target_list: false,
			statusbar: false,
			image_description: false,
			external_plugins: {

			}
			/*,
			file_browser_callback: function(field, url, type, win) {
				if(type == 'image') { 
					$('#EditorUploadForm input').click();
				}
			}
			*/
		});
	};

	$(document).ready(function() {
		$('.editor').editor();
		//$('.summernote').summernote();
		/*
		var form = $("<form enctype='multipart/form-data' id='EditorUploadForm' action='/page_photos/page_photos/upload' style='width: 0px; height: 0px; overflow: hidden;' method='post json'></form>");
		var fileinput = $("<input type='file' onChange='$(this).closest(\"form\").submit();'/>");
		var hidden = $("<input type='hidden' name='data[in_editor]' value='1'/>");
		form.append(fileinput);
		form.append(hidden);

		$('.editor').after(form);
		*/
	});
})(jQuery);
