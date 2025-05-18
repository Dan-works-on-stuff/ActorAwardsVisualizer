const http = require('http');
const fs = require('fs');
const path = require('path');
const newsService = require('./src/services/newsService');

const server = http.createServer(async (req, res) => {
    // Handle API endpoint
    if (req.url === '/api/celebrity-news') {
        try {
            const news = await newsService.getRandomCelebrityNews();
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(news));
            return;
        } catch (error) {
            console.error('Error fetching news:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch news' }));
            return;
        }
    }

    // Handle static files
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

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
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success!
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});