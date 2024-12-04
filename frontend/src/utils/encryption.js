// src/utils/encryption.js
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-replace-in-production';

export const encryption = {
  encrypt(text) {
    if (!text) return null;
    try {
      const textToChars = text => text.split('').map(c => c.charCodeAt(0));
      const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
      const applySaltToChar = code => textToChars(ENCRYPTION_KEY).reduce((a,b) => a ^ b, code);

      return text
        .split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
    } catch (e) {
      console.error('Encryption failed:', e);
      return null;
    }
  },

  decrypt(encoded) {
    if (!encoded) return null;
    try {
      const textToChars = text => text.split('').map(c => c.charCodeAt(0));
      const applySaltToChar = code => textToChars(ENCRYPTION_KEY).reduce((a,b) => a ^ b, code);
      return encoded
        .match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
    } catch (e) {
      console.error('Decryption failed:', e);
      return null;
    }
  }
};