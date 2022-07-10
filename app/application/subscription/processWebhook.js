module.exports = function(body, signature){
	if(!body || !signature){
		throw new Error('Body and signature are empty');
	}

	return {
		'body': body,
		'signature': signature,
	}
}
