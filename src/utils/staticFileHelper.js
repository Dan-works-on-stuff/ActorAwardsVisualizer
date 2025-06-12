const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

/**
 * Reads a file from the public directory and serves it.
 * Handles 404 Not Found and other server errors.
 * @param {string} pathname - The URL path of the file to serve.
 * @param {string} publicDir - The absolute path to the 'public' directory.
 * @param {http.ServerResponse} res - The response object.
 */
function serveStaticFile(pathname, publicDir, res) {
    const filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found, serve the custom 404 page
                fs.readFile(path.join(publicDir, '404.html'), (notFoundErr, notFoundContent) => {
                    if (notFoundErr) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1>');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(notFoundContent);
                    }
                });
            } else {
                // Other server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

module.exports = {
    serveStaticFile
};