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

module.exports = {
    verifyPassword
};