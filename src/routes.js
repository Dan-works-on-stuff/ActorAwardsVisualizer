const { URL } = require('url');
const path = require('path');
const newsController = require('./controllers/newsController');
const statsController = require('./controllers/statsController');
const { serveStaticFile } = require('./utils/staticFileHelper');

const apiRoutes = {
    '/api/celebrity-news': newsController.getCelebrityNews,
    '/api/stats': statsController.getStats,
    '/api/top-actors-stats': statsController.getTopActorsStats, // Add the new route
    '/api/top-movies-stats': statsController.getTopMoviesStats
};

// Define directories
const publicDir = path.join(__dirname, '..', 'public');
const utilsDir = path.join(__dirname, 'utils'); // The actual path to your utils folder

function router(req, res) {
    const parsedUrl = new URL(req.url, `https://${req.headers.host}`);
    let pathname = parsedUrl.pathname;

    if (pathname === '/') {
        pathname = '/index.html';
    }

    const handler = apiRoutes[pathname];

    if (handler) {
        // Handle API routes
        handler(req, res);
    } else if (pathname.startsWith('/utils/')) {
        // If the request is for a file in /utils/, serve it from the src/utils directory
        const fileName = pathname.substring('/utils/'.length);
        serveStaticFile(fileName, utilsDir, res);
    } else {
        // Handle all other static files from the 'public' directory
        serveStaticFile(pathname, publicDir, res);
    }
}

module.exports = router;