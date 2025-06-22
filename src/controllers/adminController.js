const sqlite3= require('sqlite3').verbose();
const db = new sqlite3.Database('./src/data/actors_awards.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

function verifyPassword(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });

    req.on('end', () => {
        try {
            const { password } = JSON.parse(body);
            // The password from the .env file is loaded into process.env
            const correctPassword = process.env.ADMIN_PASSWORD;

            if (password && password === correctPassword) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Incorrect password' }));
            }
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
        }
    });
}

function getReports(req, res) {
    // Alias reportId to id to match the frontend's expectation.
    const sql = 'SELECT reportId AS id, message FROM "Report" ORDER BY id ASC';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching reports:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error fetching reports from database' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
    });
}

module.exports = {
    verifyPassword,
    getReports
};