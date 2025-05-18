const http = require('http');
const fs = require('fs');
const path = require('path');

// Import the new service function name
const newsService = require('./src/services/newsService');

const server = http.createServer(async (req, res) => {

    // Create a new URL object using the WHATWG URL API
    // Use a base URL like 'http://localhost' or preferably use the host from request headers
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    const pathname = parsedUrl.pathname; // Get the path part
    const queryParams = parsedUrl.searchParams; // Get the URLSearchParams object

    // Handle API endpoint using the parsed pathname
    if (pathname === '/api/celebrity-news') {
        try {
            // Get the value of the 'query' parameter using searchParams.get()
            const searchQuery = queryParams.get('query');

            // Call the updated service function, passing the searchQuery
            const news = await newsService.fetchCelebrityNews(searchQuery);

            // Set response headers and send the JSON response
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Good for development, consider more specific origins in production
            });
            res.end(JSON.stringify(news)); // Send the news data as JSON
            return; // Stop further processing for this request
        } catch (error) {
            console.error('Error fetching news:', error);
            // Send an appropriate error response
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch news' }));
            return; // Stop further processing for this request
        }
    }

    // Handle static files for all other paths
    // Construct the file path based on the pathname
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

    // Get the file extension
    const extname = path.extname(filePath);

    // Set content type based on extension
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    }[extname] || 'text/plain';

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found (e.g., /non-existent-page)
                // Attempt to serve a custom 404 page if it exists, otherwise a simple one
                fs.readFile(path.join(__dirname, 'public', '404.html'), (notFoundErr, notFoundContent) => {
                    if (notFoundErr) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1>', 'utf-8');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(notFoundContent, 'utf-8');
                    }
                });
            } else {
                // Server error reading file
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success! Serve the requested file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});