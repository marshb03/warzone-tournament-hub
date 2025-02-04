// src/utils/cache.js
const cache = {
    set: (key, data, ttlHours) => {
      const item = {
        data,
        timestamp: new Date().getTime(),
        expiresIn: ttlHours * 60 * 60 * 1000 // Convert hours to milliseconds
      };
      localStorage.setItem(key, JSON.stringify(item));
    },
  
    get: (key) => {
      const item = localStorage.getItem(key);
      if (!item) return null;
  
      const parsedItem = JSON.parse(item);
      const now = new Date().getTime();
      
      if (now > parsedItem.timestamp + parsedItem.expiresIn) {
        localStorage.removeItem(key); // Clear expired item
        return null;
      }
  
      return parsedItem.data;
    },
  
    clear: (key) => {
      localStorage.removeItem(key);
    }
  };
  
  export default cache;