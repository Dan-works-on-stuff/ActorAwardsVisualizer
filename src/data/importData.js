const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'actors_awards.db');
const csvPath = path.resolve(__dirname, 'AAV_pre-db.csv');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Helper for simple tables like Actors, Categories, Movies
function getOrInsert(table, column, value) {
    return new Promise((resolve, reject) => {
        if (!value) {
            return resolve(null);
        }
        db.get(`SELECT id FROM ${table} WHERE ${column} = ?`, [value], (err, row) => {
            if (err) return reject(err);
            if (row) {
                resolve(row.id);
            } else {
                db.run(`INSERT INTO ${table} (${column}) VALUES (?)`, [value], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            }
        });
    });
}

// Specific helper for Awards table to handle name and unique year
// Specific helper for Awards table to handle name and unique year
function getOrInsertAward(name, year) {
    return new Promise((resolve, reject) => {
        if (!name || !year) return resolve(null);
        // Correctly check for both name and year to find the specific award
        db.get(`SELECT id FROM Awards WHERE name = ? AND year = ?`, [name, year], (err, row) => {
            if (err) return reject(err);
            if (row) {
                resolve(row.id);
            } else {
                db.run(`INSERT INTO Awards (name, year) VALUES (?, ?)`, [name, year], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            }
        });
    });
}

// Helper to insert nomination
function insertNomination(awardId, categoryId, movieId, actorId, nomineeType, won) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Nominations (award_id, category_id, movie_id, actor_id, nominee_type, won) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [awardId, categoryId, movieId, actorId, nomineeType, won],
            function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

async function processCSV() {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', async () => {
                try {
                    console.log(`Processing ${rows.length} rows...`);

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];

                        try {
                            // Trim whitespace and parse data from CSV
                            const year = row.Year ? parseInt(row.Year.trim(), 10) : null;
                            const awardName = row.Award ? row.Award.trim() : null;
                            const categoryName = row.Category ? row.Category.trim() : null;
                            const actorName = row.Actor ? row.Actor.trim() : null;
                            const showTitle = row.Show ? row.Show.trim() : null;
                            const won = row.Won ? row.Won.trim().toLowerCase() === 'true' : false;

                            // Determine nominee_type based on whether an actor is listed
                            const nomineeType = actorName ? 'Actor' : 'Cast';

                            // Get existing IDs or create new entries using the helpers
                            const actorId = await getOrInsert('Actors', 'name', actorName);
                            const categoryId = await getOrInsert('Categories', 'name', categoryName);
                            const movieId = await getOrInsert('Movies', 'title', showTitle);
                            const awardId = await getOrInsertAward(awardName, year);

                            // Insert the nomination with all the correct foreign keys
                            await insertNomination(awardId, categoryId, movieId, actorId, nomineeType, won);

                            if ((i + 1) % 100 === 0) {
                                console.log(`Processed ${i + 1}/${rows.length} rows...`);
                            }

                        } catch (err) {
                            console.error('Error processing row:', err.message, 'for row:', row);
                        }
                    }

                    console.log('All rows processed successfully!');
                    resolve();
                } catch (err) {
                    reject(new Error(`CSV processing failed: ${err.message}`));
                }
            })
            .on('error', reject);
    });
}

db.serialize(async () => {
    try {
        await processCSV();
        console.log('Database import finished successfully.');
    } catch (err) {
        console.error('Error during import:', err.message);
    } finally {
        db.close((err) => {
            if (err) {
                return console.error('Error closing database:', err.message);
            }
            console.log('Database connection closed.');
        });
    }
});