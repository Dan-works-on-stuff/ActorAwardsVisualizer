const https = require('https');
const config = require('../config'); // Use the main config file
const GNEWS_API_KEY = config.gnews.apiKey;
const GNEWS_BASE_URL = 'gnews.io';

if (!GNEWS_API_KEY) {
    throw new Error('GNEWS_KEY is not defined. Please ensure it is set in your .env file and loaded correctly in the config.');
}

/**
 * Fetches news articles from the GNews API.
 * @param {string} query - The search term (e.g., celebrity name).
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON response from the API.
 */
function fetchNews(query) {
    // GNews API can use quotes for more exact phrase matching
    const encodedQuery = encodeURIComponent(`"${query}"`);
    const path = `/api/v4/search?q=${encodedQuery}&lang=en&token=${GNEWS_API_KEY}`;

    const options = {
        hostname: GNEWS_BASE_URL,
        path: path,
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`GNews API responded with status code ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON response: ${e.message}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

module.exports = {
    fetchNews
};