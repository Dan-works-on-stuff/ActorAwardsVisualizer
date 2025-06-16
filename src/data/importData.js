//posibil sa fie bun scriptul asta, l-am verificat cat de meticulos posibil, dar e deja trecut de 10 jum seara si daca ma apuc sa il rulez si nu e bun ceva cred ca stau pana la 1
// si nu cred ca e bine, fac maine cred asta

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
function getOrInsertAward(name, year) {
    return new Promise((resolve, reject) => {
        if (!name || !year) return resolve(null);
        // Your schema has year as UNIQUE, so we query by year.
        db.get(`SELECT id FROM Awards WHERE year = ?`, [year], (err, row) => {
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

db.serialize(() => {
    // This SQL now matches your Nominations table schema
    const insertNomination = db.prepare(
        `INSERT INTO Nominations (award_id, category_id, movie_id, actor_id, nominee_type, won) 
         VALUES (?, ?, ?, ?, ?, ?)`
    );

    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', async (row) => {
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
                insertNomination.run(awardId, categoryId, movieId, actorId, nomineeType, won, (err) => {
                    if (err) {
                        console.error('Error inserting nomination:', err.message, 'for row:', row);
                    }
                });

            } catch (err) {
                console.error('Error processing row:', err.message, 'for row:', row);
            }
        })
        .on('end', () => {
            insertNomination.finalize((err) => {
                if (err) {
                   console.error('Error finalizing statement:', err.message);
                }
                db.close((err) => {
                    if (err) {
                        return console.error('Error closing database:', err.message);
                    }
                    console.log('Database import finished and connection closed.');
                });
            });
        });
});