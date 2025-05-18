// Import the updated news service function
const newsService = require('../services/newsService');

/**
 * Controller function to handle requests for celebrity news.
 * Extracts the search query from the request and calls the news service.
 * @param {object} req - The request object. Expected to potentially have a 'query' property on it, containing URL query parameters.
 * @param {object} res - The response object, used to send the JSON response back.
 */
async function fetchCelebrityNews(req, res) {
    try {
        // Extract the 'query' parameter from the request's query string.
        // We assume that your server setup parses the URL and makes query parameters
        // available on 'req.query'. If not, you might need to manually parse req.url.
        const searchQuery = req.query ? req.query.query : undefined; // Safely access req.query.query

        // Call the news service function, passing the extracted query.
        // The service function handles whether to perform a specific search or get latest news.
        const news = await newsService.fetchCelebrityNews(searchQuery);

        // Send the fetched news data as a JSON response using the response object.
        // We assume 'res' has a 'json' method similar to Express, or you might
        // need to manually set headers and res.end(JSON.stringify(news)).
        if (res && typeof res.json === 'function') {
            res.json(news);
        } else {
            // Fallback if res.json is not available (e.g., pure http module)
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(news));
        }

    } catch (error) {
        console.error('Error in newsController.fetchCelebrityNews:', error);
        // Send an error response.
        // Assuming 'res' has a 'status' method and 'json' method.
        if (res && typeof res.status === 'function' && typeof res.json === 'function') {
            res.status(500).json({ error: 'Failed to fetch news' });
        } else {
            // Fallback for pure http module
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Failed to fetch news' }));
        }

    }
}

// Export the new function so it can be used by your server's routing logic
module.exports = {
    fetchCelebrityNews
};