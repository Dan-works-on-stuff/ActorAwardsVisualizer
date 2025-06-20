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

function getTopMoviesStats(req, res) {
    statsModel.getTopMoviesByNominations((err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error fetching top movies stats.' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    });
}

function getCategoryStats(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const entityName = parsedUrl.searchParams.get('entity');

    if (!entityName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Entity name is required' }));
        return;
    }

    statsModel.getNominationsByCategory(entityName, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error fetching category stats' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    });
}

async function getWinnersTable(req, res) {
    try {
        const winners = await statsModel.getWinners();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(winners));
    } catch (error) {
        console.error('Error in getWinnersTable:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch winners' }));
    }
}

module.exports = {
    getStats,
    getTopActorsStats,
    getTopMoviesStats,
    getCategoryStats,
    getWinnersTable
};