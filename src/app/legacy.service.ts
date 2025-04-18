import { Injectable } from '@angular/core';

/**
 * modified from version 1.3.1 of legacy.js at privatebin.
 */
@Injectable({
  providedIn: 'root'
})
export class LegacyService {

  hostname = [
    'localhost',
    '127.0.0.1',
    '[::1]'
  ];
  tld = [
    '.onion',
    '.i2p'
  ]
  constructor() { }

  isSecureContext(){
    // use .isSecureContext if available
    if (window.isSecureContext === true || window.isSecureContext === false) {
	return window.isSecureContext;
    }

    // HTTP is obviously insecure
    if (window.location.protocol !== 'http:') {
	return true;
    }

    // filter out actually secure connections over HTTP
    for (var i = 0; i < this.tld.length; i++) {
	if (
	    window.location.hostname.indexOf(
		this.tld[i],
		window.location.hostname.length - this.tld[i].length
	    ) !== -1
	) {
	    return true;
	}
    }

    // whitelist localhost for development
    for (var j = 0; j < this.hostname.length; j++) {
	if (window.location.hostname === this.hostname[j]) {
	    return true;
	}
    }

    // totally INSECURE http protocol!
    return false;
  }

  isOldBrowser() {
    // webcrypto support
    if (!(
	'crypto' in window &&
	'getRandomValues' in window.crypto &&
	'subtle' in window.crypto &&
	'encrypt' in window.crypto.subtle &&
	'decrypt' in window.crypto.subtle &&
	'Uint8Array' in window &&
	'Uint32Array' in window
    )) {
	return true;
    }

    // async & ES6 support
    try {
      new Function('async () => {}');
    } catch (e) {
      if (e instanceof SyntaxError) {
        return true;
      } else {
        throw e; // throws CSP error
      }
    }

    return false;
  }
}
