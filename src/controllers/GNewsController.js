const GNewsModel = require('../models/GNewsModel');

/**
 * Controller to handle requests for news from GNews API.
 * Expects a 'query' parameter with the search term.
 */
async function getGNews(req, res) {
    try {
        const query =
            // req.query?.query ||
            (req.url && new URL(req.url, `https://${req.headers.host}`).searchParams.get('query'));

        if (!query) {
            const errorPayload = { error: 'Query parameter is required.' };
            if (res.status) {
                return res.status(400).json(errorPayload);
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(errorPayload));
            }
        }

        const result = await GNewsModel.fetchNews(query);

        res.writeHead?.(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        });

        if (res.json) {
            res.json(result);
        } else {
            res.end(JSON.stringify(result));
        }
    } catch (error) {
        console.error('Error in GNewsController:', error);
        const errorPayload = { error: 'Failed to fetch news' };
        if (res.status) {
            res.status(500).json(errorPayload);
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorPayload));
        }
    }
}

module.exports = {
    getGNews,
};