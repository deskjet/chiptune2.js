export function atob(input) {
	/*
	This code was written by Tyler Akins and has been placed in the
	public domain.  It would be nice if you left this header intact.
	Base64 code from Tyler Akins -- http://rumkin.com
	*/
	const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	
	let output = ''
	let chr1, chr2, chr3
	let enc1, enc2, enc3, enc4
	let i = 0
	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
	do {
		enc1 = keyStr.indexOf(input.charAt(i++))
		enc2 = keyStr.indexOf(input.charAt(i++))
		enc3 = keyStr.indexOf(input.charAt(i++))
		enc4 = keyStr.indexOf(input.charAt(i++))
	
		chr1 = (enc1 << 2) | (enc2 >> 4)
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
		chr3 = ((enc3 & 3) << 6) | enc4
	
		output = output + String.fromCharCode(chr1)
		if (enc3 !== 64) output = output + String.fromCharCode(chr2)
		if (enc4 !== 64) output = output + String.fromCharCode(chr3)
	} while (i < input.length)
	return output
}

export const performance = {
	now() {
		return Date.now()
	}
}

export const crypto = {
	getRandomValues(array) {
		for (let i = 0; i < array.length; i++) {
			array[i] = (Math.random() * 256) | 0
		}
	}
}
