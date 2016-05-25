$(function(){
	Stripe.setPublishableKey('pk_test_tljppQ1Bsb0MN9Vm2awiPEyq');

	// spinner options
	var opts = {
		  lines: 13 // The number of lines to draw
		, length: 56 // The length of each line
		, width: 16 // The line thickness
		, radius: 51 // The radius of the inner circle
		, scale: 1 // Scales overall size of the spinner
		, corners: 1 // Corner roundness (0..1)
		, color: '#000' // #rgb or #rrggbb or array of colors
		, opacity: 0.1 // Opacity of the lines
		, rotate: 0 // The rotation offset
		, direction: 1 // 1: clockwise, -1: counterclockwise
		, speed: 0.7 // Rounds per second
		, trail: 60 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '50%' // Top position relative to parent
		, left: '50%' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'absolute' // Element positioning
	}

	$('#search').on('keyup', function(){
		var search_term = $(this).val();

		$.ajax({
			method: 'post',
			url: '/api/search',
			data: {
				search_term
			},
			dataType: 'json',
			success: function(json){ //json -returned object
				var data = json.hits.hits.map(function(hit){
					return hit;
				});

				$('#searchResults').empty();

				data.forEach(function(obj){
					var html = "";
					html += '<div class="col-md-4">';
					html += '<a href="/product/' + obj._source._id  + '">';
					html += '<div class="thumbnail">';
					html += '<img src="' + obj._source.image + '" />';
					html += '<div class="caption">';
					html += '<h3>' + obj._source.name + '</h3>';
					html += '<p>' + obj._source.category.name + '</p>';
					html += '<p>$' + obj._source.price + '</p>';
					html += '</div>';
					html += '</div>';
					html += '</a>';
					html += '</div>';

					$('#searchResults').append(html);
				});
			},

			error: function(error){
				console.log(error);
			}
		});
	});

	$("#plus").on("click", function(){
		var product_price = parseFloat($("#product_price").html());
		var totalPrice = parseFloat($("#total").html());
		var quantity = parseInt($("#count").html());
		
		totalPrice += product_price;
		quantity++;

		$("#count").html(quantity);
		$("#total").html(totalPrice.toFixed(2));

		//hidden fields
		$("#quantity").val(quantity);
		$("#totalPrice").val(totalPrice);
	});

	$("#minus").on("click", function(){
		var quantity = parseInt($("#count").html());
		if(quantity <= 1){
			return;
		}

		var product_price = parseFloat($("#product_price").html());
		var totalPrice = parseFloat($("#total").html());
		var quantity = parseInt($("#count").html());

		totalPrice -= product_price;
		quantity--;

		$("#count").html(quantity);
		$("#total").html(totalPrice.toFixed(2));

		//hidden fields
		$("#quantity").val(quantity);
		$("#totalPrice").val(totalPrice);
	});

	$('#payment-form').submit(function(event) {
  	// this - form itself
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);
 
    // Prevent the form from submitting with the default action
    return false;
  });

  function stripeResponseHandler(status, response) {
	  var $form = $('#payment-form');

	  if (response.error) {
	    // Show the errors on the form
	    $form.find('.payment-errors').text(response.error.message);
	    $form.find('button').prop('disabled', false);
	  } else {
	    // response contains id and card, which contains additional card details
	    var token = response.id;
	    // Insert the token into the form so it gets submitted to the server
	    $form.append($('<input type="hidden" name="stripeToken" />').val(token));

	    var spinner = new Spinner(opts).spin();
	    $('#loading').append(spinner.el);
	    // and submit(re-submit the form to stripe)
	    $form.get(0).submit();
	  }
	};

});

