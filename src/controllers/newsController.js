const NewsModel = require('../models/NewsModel');

/**
 * Controller to handle requests for celebrity news (actor movies/awards from TMDB)
 * Expects an optional 'query' parameter with the actor name.
 */
async function getCelebrityNews(req, res) {
    try {
        // Support both Express and pure Node style (check for both req.query and fallback)
        const query =
            req.query && req.query.query
                ? req.query.query
                : req.url && new URL(req.url, `http://${req.headers.host}`).searchParams.get('query');

        const result = await NewsModel.fetchCelebrityNews(query);

        res.writeHead?.(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        });

        // Express-like: res.json, plain Node: res.end
        if (res.json) {
            res.json(result);
        } else {
            res.end(JSON.stringify(result));
        }
    } catch (error) {
        console.error('Error in newsController:', error);

        if (res.writeHead) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch celebrity movies/awards' }));
        } else if (res.status) {
            res.status(500).json({ error: 'Failed to fetch celebrity movies/awards' });
        }
    }
}

module.exports = {
    getCelebrityNews,
};