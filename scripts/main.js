// Add your javascript here
// Don't forget to add it into respective layouts where this js file is needed
$(document).ready(function() {
  AOS.init({
    // uncomment below for on-scroll animations to played only once
    // once: true
  }); // initialize animate on scroll library
});

// Smooth scroll for links with hashes
$("a.smooth-scroll").click(function(event) {
  // On-page links
  if (
    location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") &&
    location.hostname == this.hostname
  ) {
    // Figure out element to scroll to
    var target = $(this.hash);
    target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
    // Does a scroll target exist?
    if (target.length) {
      // Only prevent default if animation is actually gonna happen
      event.preventDefault();
      $("html, body").animate(
        {
          scrollTop: target.offset().top
        },
        1000,
        function() {
          // Callback after animation
          // Must change focus!
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) {
            // Checking if the target was focused
            return false;
          } else {
            $target.attr("tabindex", "-1"); // Adding tabindex for elements not focusable
            $target.focus(); // Set focus again
          }
        }
      );
    }
  }
});

// Photo Filter
var activeFilter = "all";

$(".ww-filter-button").on("click", function(e) {
  // remove btn-primary from all buttons first
  $(".ww-filter-button").removeClass("btn-primary");
  $(".ww-filter-button").addClass("btn-outline-primary");

  // add btn-primary to active button
  var button = $(this);
  button.removeClass("btn-outline-primary");
  button.addClass("btn-primary");
  filterItems(button.data("filter"));
  e.preventDefault();
});

function filterItems(filter) {
  if (filter === activeFilter) {
    return;
  }

  activeFilter = filter;
  $(".ww-gallery .card").each(function() {
    var card = $(this);
    var groups = card.data("groups");
    var show = false;
    if (filter === "all") {
      show = true;
    } else {
      for (var i = 0; i < groups.length; i++) {
        if (groups[i] === filter) {
          show = true;
        }
      }
    }
    // hide everything first
    card.fadeOut(400);
    setTimeout(function() {
      if (show && !card.is(":visible")) {
        card.fadeIn(400);
      }
    }, 500);
  });
}

// Light Box
$(document).on("click", '[data-toggle="lightbox"]', function(event) {
  event.preventDefault();
  $(this).ekkoLightbox();
});

// Airtable connexion.
$(document).ready(function() {
  var Airtable = require('airtable');

  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: atob(eval(atob('JChhdG9iKCdJMkYwYVdRPScpKS5hdHRyKGF0b2IoJ1pHRjBZUzFoZEhSeUxXRjBhV1E9Jykp'))),
  });

  var base = Airtable.base('appJshxpUksuHpFEq');
  $('#rsvp-form').on('submit', (e) => {
    const name = $('#name-input').val();
    const presence = $('#events-input').val() === "1";
    $('#rsvp-form-message').html('Veuillez patienter...').show();
    $('#rsvp-form .row, #rsvp-form .btn-submit').hide();

    base('Mariage').create([
      {
        "fields": {
          "Nom": name,
          "Email": $('#email-input').val(),
          "Téléphone": $('#phone-input').val(),
          "Présence": presence,
          "Allergies alimentaires": $('#food-input').val(),
          "Achat tenue": $('#clothes-input').val() === "1",
          "Commentaire": $('#message-input').val(),
        }
      }
    ], function(err, records) {
      if (err) {
        $('#rsvp-form-message').html('ERREUR');
        return;
      }

      let message = '';
      if (presence) {
        message = 'Génial ! '+name+', nous avons hâte de vous voir, nous vous contacterons pour vos transmettre de plus amples informations.'
      } else {
        message = 'Oh non '+name+', c\'est trop dommage, nous avons bien noté votre réponse et nous remercions.'
      }

      $('#rsvp-form-message').html(message).show();
      $('#rsvp-form .row, #rsvp-form .btn-submit').hide();
    });

    e.preventDefault();
    return false;
  });
})