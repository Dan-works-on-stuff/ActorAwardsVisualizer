const { URL } = require('url');
const path = require('path');
const newsController = require('./controllers/newsController');
const { serveStaticFile } = require('./utils/staticFileHelper');

// Define your API routes
const apiRoutes = {
    '/api/celebrity-news': newsController.getCelebrityNews
};

// Go up one level from 'src' to reach the project root, then into 'public'
const publicDir = path.join(__dirname, '..', 'public');

// The main router function
function router(req, res) {
    const parsedUrl = new URL(req.url, `https://${req.headers.host}`);
    let pathname = parsedUrl.pathname;

    if (pathname === '/') {
        pathname = '/index.html';
    }

    const handler = apiRoutes[pathname];

    if (handler) {
        // If the path matches an API route, call its handler
        handler(req, res);
    } else {
        // Otherwise, delegate to the static file helper
        serveStaticFile(pathname, publicDir, res);
    }
}

module.exports = router;