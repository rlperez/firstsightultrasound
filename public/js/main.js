
$(document).ready(function () {

  "use strict";
  jQuery(document).ready(function ($) {

    //youtube video
    $('.youtube-bg').YTPlayer({
      containment: '.youtube-bg',
      autoPlay: true,
      loop: true,
      mute: true,
      startAt: 71,
      stopAt: 250,
      opacity: 1,
    });

    //this is for blog area
    $('.recent-blog').owlCarousel({
      loop: true,
      margin: 0,
      nav: true,
      dots: true,
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
      autoplay: true,
      autoplayTimeout: 4000,
      autoplaySpeed: 1500,
      navSpeed: 800,
      pagination: true,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 2
        },
        1000: {
          items: 2
        }
      }
    });


    //this is for service area

    $('.service-content-area').owlCarousel({
      dots: false,
      loop: true,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplaySpeed: 1000,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 2
        },
        1000: {
          items: 3
        }
      }
    });

    //this is for client area

    $('.client-content-area').owlCarousel({
      loop: true,
      autoplay: false,
      nav: false,
      dots: true,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 1
        },
        1000: {
          items: 1
        }
      }
    });




    //this is for project area

    $('.work-content-area').owlCarousel({
      loop: true,
      autoplay: true,
      nav: false,
      autoplayTimeout: 3000,
      autoplaySpeed: 1000,
      responsive: {
        0: {
          items: 2
        },
        600: {
          items: 3
        },
        1000: {
          items: 5
        }
      }
    });


    //counterUp

    $('.counter').counterUp({
      delay: 10,
      time: 1000
    });



    // Menu sticky
    $(window).on('scroll', function () {
      var scroll = $(window).scrollTop();
      if (scroll < 30) {
        $("#sticky-header").removeClass("sticky-menu");
      } else {
        $("#sticky-header").addClass("sticky-menu");
      }
    });



    // Navbar collapse on click
    $('.nav a').on('click', function () {
      if ($('.navbar-toggle').css('display') != 'none') {
        $(".navbar-toggle").trigger("click");
      }
    });

    // Scroll To Top
    $("#toTop").scrollToTop(600);

    // Wow js
    new WOW().init();







    //this is for home-slider page	
    $('.banner-slider-items').owlCarousel({
      loop: true,
      autoplay: false,
      autoplayTimeout: 3000,
      animateIn: 'fadeIn',
      animateOut: 'fadeOut',
      mouseDrag: false,
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
      nav: true,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 1
        },
        1000: {
          items: 1
        }
      }
    });

    //this is for home-slider page	
    $('.blog-slider').owlCarousel({
      loop: true,
      autoplay: false,
      dots: true,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 1
        },
        1000: {
          items: 1
        }
      }
    });




    // Portfolio Area
    $('.grid').imagesLoaded(function () {

      // init Isotope
      var $grid = $('.grid').isotope({
        itemSelector: '.grid-item',
        percentPosition: true,
        masonry: {
          // use outer width of grid-sizer for columnWidth
          columnWidth: 1
        }
      });

      // filter items on button click
      $('.portfolio-menu').on('click', 'button', function () {
        var filterValue = $(this).attr('data-filter');
        $grid.isotope({ filter: filterValue });
      });

      $('.portfolio-menu button').on('click', function (event) {
        $(this).siblings('.active').removeClass('active');
        $(this).addClass('active');
        event.preventDefault();
      });
    });

    // Magnific Popup Images
    $('.pop-image').magnificPopup({
      type: 'image',
      removalDelay: 300,
      mainClass: 'mfp-with-zoom',
      gallery: {
        enabled: true
      }
    });

    //Magnific Popup Images
    $('.pop-video').magnificPopup({
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,
      gallery: {
        enabled: false
      }
    });

    // Fix nav urls when not on homepage
    
    
    if ($('#is_home').val() !== 'true') {
      $('#main-menu a').each(function () {
        console.log(this);
        $(this).attr('href', 'http://' + window.location.host + '/' + $(this).attr('href'));
      });
    }

    //Preloader
    var preloader = $('.preloader');
    $(window).on('load', function () {
      preloader.remove();
    });

    //google-map
    var myCenter = new google.maps.LatLng(39.414928, -76.613576);
    function initialize() {
      var mapProp = {
        center: myCenter,
        scrollwheel: false,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      };
      var map = new google.maps.Map(document.getElementById("map-space"), mapProp);
      var marker = new google.maps.Marker({
        position: myCenter,
        animation: google.maps.Animation.DROP,
        icon: 'images/map-marker.png',
        map: map,
      });


      var styles = [
        {
          stylers: [
            { hue: "#343434" },
            { saturation: -100 }
          ]
        },
      ];
      map.setOptions({ styles: styles });
      marker.setMap(map);
    }
    google.maps.event.addDomListener(window, 'load', initialize);


  });

}(jQuery));	
