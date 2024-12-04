// src/services/storage.js
import { encryption } from '../utils/encryption';

export const storage = {
  setSecure(key, value) {
    const encrypted = encryption.encrypt(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  },

  getSecure(key) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    const decrypted = encryption.decrypt(encrypted);
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};