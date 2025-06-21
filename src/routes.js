const { URL } = require('url');
const path = require('path');
const newsController = require('./controllers/SearchMoviesController');
const statsController = require('./controllers/statsController');
const gNewsController = require('./controllers/GNewsController');
const adminController = require('./controllers/adminController'); // Import adminController
const reportController = require('./controllers/reportController');
const { serveStaticFile } = require('./utils/staticFileHelper');

const apiRoutes = {
    '/api/celebrity-news': newsController.getCelebrityNews,
    '/api/gnews': gNewsController.getGNews,
    '/api/stats': statsController.getStats,
    '/api/top-actors-stats': statsController.getTopActorsStats,
    '/api/top-movies-stats': statsController.getTopMoviesStats,
    '/api/category-stats': statsController.getCategoryStats,
    '/api/winners': statsController.getWinnersTable,
    '/api/admin/verify': adminController.verifyPassword, // Add verification route
    '/api/report': reportController.createReport
};

// Define directories
const publicDir = path.join(__dirname, '..', 'public');
const utilsDir = path.join(__dirname, 'utils');

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