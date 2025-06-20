const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { fetchFromTMDB } = require('../models/SearchMoviesModel');

const dbPath = path.resolve(__dirname, 'actors_awards.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

async function getMoviesWithoutReleaseYear() {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, title FROM Movies WHERE release_year IS NULL', (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

async function updateMovieReleaseYear(movieId, year) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE Movies SET release_year = ? WHERE id = ?', [year, movieId], function(err) {
            if (err) {
                reject(err);
            }
            resolve(this.changes);
        });
    });
}

async function fetchAndupdateMovieReleaseYears() {
    const movies = await getMoviesWithoutReleaseYear();
    console.log(`Found ${movies.length} movies without a release year.`);

    for (const movie of movies) {
        try {
            const searchResults = await fetchFromTMDB('/3/search/movie', { query: movie.title });
            if (searchResults.results && searchResults.results.length > 0) {
                const releaseDate = searchResults.results[0].release_date;
                if (releaseDate) {
                    const year = new Date(releaseDate).getFullYear();
                    await updateMovieReleaseYear(movie.id, year);
                    console.log(`Updated release year for "${movie.title}" to ${year}.`);
                }
            }
        } catch (error) {
            console.error(`Error updating release year for "${movie.title}":`, error);
        }
    }
}

db.serialize(async () => {
    try {
        await fetchAndupdateMovieReleaseYears();
        console.log('Finished updating movie release years.');
    } catch (err) {
        console.error('An error occurred during the update process:', err.message);
    } finally {
        db.close((err) => {
            if (err) {
                return console.error('Error closing database:', err.message);
            }
            console.log('Database connection closed.');
        });
    }
});