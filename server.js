require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });const http = require('http');
const router = require('./src/routes.js'); // Import the router


// Create the server and use the router to handle all requests
const server = http.createServer(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});