$(function(){

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

});