import cache from '../utils/cache.js';

/**
 * Express middleware to cache API responses based on the request URL.
 * @param {number} durationInSeconds - How long to keep the response in the cache
 */
export const cacheResponse = (durationInSeconds) => {
  return (req, res, next) => {
    // We only want to cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate a unique key for the cache based on the full URL (including query strings like ?keyword=wheat)
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // If we have a cached response, serve it immediately and bypass the controller
      return res.json(JSON.parse(cachedResponse));
    } else {
      // If no cache exists, we hijack the res.json method to intercept the response
      const originalJson = res.json;
      
      res.json = (body) => {
        // Save the generated JSON body into the cache
        cache.set(key, JSON.stringify(body), durationInSeconds);
        // Call the original res.json method to actually send the data to the client
        originalJson.call(res, body);
      };
      
      next();
    }
  };
};

/**
 * Helper to manually invalidate cache for specific routes (e.g. when a product is added/deleted)
 * @param {string} routePrefix - The starting string of the route (e.g. "/api/products")
 */
export const invalidateCache = (routePrefix) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.startsWith(`__express__${routePrefix}`));
  
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
    console.log(`🧹 Cache invalidated for routes starting with: ${routePrefix}`);
  }
};
