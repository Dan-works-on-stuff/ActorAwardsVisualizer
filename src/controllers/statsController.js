const fs = require('fs');
const path = require('path');

function getStats(req, res) {
    //debug
    console.log('//debug: getStats function in statsController was called.');
    const statsFilePath = path.join(__dirname, '..', 'data', 'stats.json');

    fs.readFile(statsFilePath, (err, data) => {
        if (err) {
            //debug
            console.error('//debug: Error reading stats.json file:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error reading stats data' }));
            return;
        }
        //debug
        console.log('//debug: Successfully read stats.json and sending data to client.');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
    });
}

module.exports = {
    getStats
};