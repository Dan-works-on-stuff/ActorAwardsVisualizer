const sqlite3 = require('sqlite3').verbose();
const path = require('path');
// const db= require('../data/actors_awards.db');
const dbPath = path.join(__dirname, '..', 'data', 'actors_awards.db');

function getActorNominations(actorName, callback) {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
            return callback(err);
        }
    });

    const tenYearsAgo = new Date().getFullYear() - 10;

    const query = `
        SELECT A.year, C.name as category, N.won
        FROM Nominations N
                 JOIN Actors ACT ON N.actor_id = ACT.id
                 JOIN Awards A ON N.award_id = A.id
                 JOIN Categories C ON N.category_id = C.id
        WHERE ACT.name = ? AND A.year >= ?
        ORDER BY A.year, C.name;
    `;

    db.all(query, [actorName, tenYearsAgo], (err, rows) => {
        if (err) {
            console.error('Error running query', err.message);
            db.close();
            return callback(err);
        }
        db.close();
        callback(null, rows);
    });
}

// New function to get top actors by nominations
function getTopActorsByNominations(callback) {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
            return callback(err);
        }
    });

    // Corrected to 10 years and variable renamed for clarity
    const tenYearsAgo = new Date().getFullYear() - 10;

    const query = `
        SELECT
            ACT.name,
            COUNT(N.id) as nomination_count
        FROM Nominations N
                 JOIN Actors ACT ON N.actor_id = ACT.id
                 JOIN Awards A ON N.award_id = A.id
        WHERE A.year >= ?
        GROUP BY ACT.name
        ORDER BY nomination_count DESC;
    `;

    // Pass the correct variable to the query
    db.all(query, [tenYearsAgo], (err, rows) => {
        if (err) {
            console.error('Error running query', err.message);
            db.close();
            return callback(err);
        }
        db.close();
        callback(null, rows);
    });
}

function getTopMoviesByNominations(callback) {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
            return callback(err);
        }
    });

    const tenYearsAgo = new Date().getFullYear() - 10;

    const query = `
        SELECT
            M.title,
            COUNT(N.id) as nomination_count
        FROM Nominations N
        JOIN Movies M ON N.movie_id = M.id
        JOIN Awards A ON N.award_id = A.id
        WHERE A.year >= ?
        GROUP BY M.title
        ORDER BY nomination_count DESC;
    `;

    db.all(query, [tenYearsAgo], (err, rows) => {
        if (err) {
            console.error('Error running query', err.message);
            db.close();
            return callback(err);
        }
        db.close();
        callback(null, rows);
    });
}

// function getWinners() {
//     return new Promise((resolve, reject) => {
//         const sql = `
//             SELECT
//                 a.name,
//                 SUM(CASE WHEN n.won = 1 THEN 1 ELSE 0 END) as wins,
//                 COUNT(n.id) as nominations
//             FROM Actors a
//             JOIN Nominations n ON a.id = n.actor_id
//             WHERE a.name IS NOT NULL AND a.name != ''
//             GROUP BY a.name
//             HAVING wins > 0
//             ORDER BY wins DESC, nominations DESC;
//         `;
//         db.all(sql, [], (err, rows) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// }

function getWinners() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
            return Promise.reject(err);
        }
    });

    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                a.name,
                SUM(CASE WHEN n.won = 1 THEN 1 ELSE 0 END) as wins,
                COUNT(n.id) as nominations
            FROM Actors a
            JOIN Nominations n ON a.id = n.actor_id
            WHERE a.name IS NOT NULL AND a.name != ''
            GROUP BY a.name
            HAVING wins > 0
            ORDER BY wins DESC, nominations DESC;
        `;
        db.all(sql, [], (err, rows) => {
            db.close();
            if (err) {
                console.error('Error running query', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}




module.exports = {
    getActorNominations,
    getTopActorsByNominations, // Export the new function
    getTopMoviesByNominations,
    getWinners
};