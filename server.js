const http = require('http');
const router = require('./src/routes.js'); // Import the router
const config = require('./src/config'); // Import the centralized config

// Create the server and use the router to handle all requests
const server = http.createServer(router);

const PORT = config.server.port;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});