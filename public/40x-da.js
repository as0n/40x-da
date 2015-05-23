function da40x(server, message, code) {
	var $40xDa = $('<div>'),
		$errCode = $('<p>'),
		$message = $('<h1>'),
		$link = $('<a>'),
		$thumbDiv = $('<div>'),
		$thumbImg = $('<img>');

	$40xDa.addClass('da40x');
	$message.text(message);
	$link.attr('target', '_blank');

	// Thumbnail
	//$thumbImg.attr('src', )
	$thumbDiv.addClass('thumb');
	$thumbDiv.append($thumbImg);

	$40xDa.append($message);
	$40xDa.append($link);

	if (code) {
		$errCode.text('E '+code);
		$40xDa.append($errCode);
	}

	$.get(server, function(data) {
		$40xDa.css('background-image', 'url("'+data.img+'")')
		$link.html('<em>'+data.title+'</em> by '+data.author);
		$link.attr('href', data.url);
		$link.append($thumbDiv);
		$thumbImg.attr('src', data.img);
		$thumbImg.attr('alt', data.title);

		$('body').append($40xDa);
	});
}

$(document).ready(function() {
	var $body = $('body'),
		mes = $body.data('foxda-message'),
		server = $body.data('foxda-server'),
		code = $body.data('foxda-code');
	if (mes && server) da40x(server, mes, code);
});