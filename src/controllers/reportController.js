// src/controllers/reportController.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./src/data/actors_awards.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

function createReport(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const { message } = JSON.parse(body);

            if (!message || message.trim() === '') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Message cannot be empty.' }));
                return;
            }

            const query = 'INSERT INTO Report (message) VALUES (?)';
            db.run(query, [message], function(err) {
                if (err) {
                    console.error('Error inserting report into database:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to submit report due to a server error.' }));
                    return;
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Report submitted successfully.' }));
            });

        } catch (error) {
            console.error('Error parsing request body:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request format.' }));
        }
    });
}

module.exports = {
    createReport
};