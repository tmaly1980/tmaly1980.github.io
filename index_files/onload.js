(function($) {
	$(document).ready(function() {

		$('.dropdown.hover').hover(function() {
			$(this).find("> .dropdown-menu").show();
		}, function() {
			$(this).find("> .dropdown-menu").hide();
		});

		$('.dropdown.toggle > a').click(function() {
			var menu = $(this).parent().find("> .dropdown-menu");
			var navbar = $(this).closest('.navbar'); //  Only close other navs in same bar.
			if(menu.is(":visible"))
			{
				menu.hide();
			} else {
				$(navbar).find('.dropdown-menu').hide();
				menu.show();
			}
		});
		$('body').on('click', function(e) {
			var target = $(e.target);
			if(!target.closest('.dropdown.toggle').size())
			{
				$('.dropdown.toggle > .dropdown-menu:visible').hide();
			}
		});
		/* DO NOT hide dropdown menu if click elsewhere on screen 
		$(document).on('click', function(e) { 
			if(!$(e.target).closest('.dropdown.toggle').size() && $('.dropdown.toggle .dropdown-menu:visible').size()) // clicked outside of open dropdown menu 
			{ // need to ensure that not inside dropdown, so initial show() works
				$('.dropdown.toggle .dropdown-menu:visible').hide();
				
			}
		});
		*/

		$('.autogrow').autogrow();

		$('a.lightbox').lightBox();

		setTimeout(function() { 
			$('#navbar .navbar-nav').autofit_nav();
			}, 500);
		// Don't know why delay  needed  but driving me crazy
		//

		// standardize datepicking
		$('.datepicker').datepicker({
			todayHighlight: true,
			toggleActive: true,
			autoclose: true
		});

		// Turn into modal alerts. - if $this->assign('flash_class','modal_flash') in view
		$('.flash_message.flash_modal, .flash_message.modal_flash').each(function() {
			var message = $(this).detach();

			var details = {
				message: message.html()
			};
			if(message.hasClass('alert-info'))
			{
				details.title = 'Notice';
				details.type = BootstrapDialog.TYPE_INFO;
			} else if (message.hasClass('alert-danger')) { 
				details.title = 'Error';
				details.type = BootstrapDialog.TYPE_DANGER;
			} else if (message.hasClass('alert-warning')) { 
				details.title = 'Warning';
				details.type = BootstrapDialog.TYPE_WARNING;
			} else if (message.hasClass('alert-success')) { 
				details.title = 'Success';
				details.type = BootstrapDialog.TYPE_SUCCESS;
			} else {
				details.title = 'Notice';
				details.type = BootstrapDialog.TYPE_PRIMARY;
			}
			BootstrapDialog.alert(details);
		});

		$('.nav-tabs a[href^=#], .nav-pills a[href^=#]').closest('.nav').tabloader();
		// only when referenced on same page, not true multipage navs
	});
	$(window).resize(function() {
		$('#navbar .navbar-nav').autofit_nav();
	});


})(jQuery);
