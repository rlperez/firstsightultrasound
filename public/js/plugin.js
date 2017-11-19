$(document).ready(function(){
	

	// skill bar
		var skillsDiv = jQuery('#skills');

		jQuery(window).on('scroll', function(){
			var winT = jQuery(window).scrollTop(),
			winH = jQuery(window).height(),
			skillsT = skillsDiv.offset().top;
		  if(winT + winH  > skillsT){
			jQuery('.skillbar').each(function(){
			  jQuery(this).find('.skillbar-bar').animate({
				width:jQuery(this).attr('data-percent')
			  },4000);
			});
		  }
		});

		
	
		//this is for business-slider area
		  $('.client-slider-content').owlCarousel({
		loop:true,
		margin:0,
		nav:true,
		dots:true,
		navText:['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
		autoplay:true,
		autoplayTimeout:2000,
		pagination: true,
		 dots: false,
		responsive:{
			0:{
				items:1
			},
			600:{
				items:1
			},
			1000:{
				items:1
			}
		}
	});

});