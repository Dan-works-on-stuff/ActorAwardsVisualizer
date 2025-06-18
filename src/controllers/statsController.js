const { URL } = require('url');
const statsModel = require('../models/statsModel');

function getStats(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const actorName = parsedUrl.searchParams.get('actor');

    if (!actorName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Actor name is required' }));
        return;
    }

    statsModel.getActorNominations(actorName, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error fetching stats data' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    });
}

// New controller function for top actors stats
function getTopActorsStats(req, res) {
    statsModel.getTopActorsByNominations((err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error fetching top actors stats' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    });
}

module.exports = {
    getStats,
    getTopActorsStats // Export the new controller function
};