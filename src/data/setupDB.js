const sqlite3 = require('sqlite3').verbose();

// This will create the database file if it doesn't exist.
const db = new sqlite3.Database('./src/data/actors_awards.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the actors_awards.db SQLite database.');
});

// Use serialize to ensure that the table creation runs in order.
db.serialize(() => {
    // Create the Actors table
    db.run(`CREATE TABLE IF NOT EXISTS Actors (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  name TEXT NOT NULL UNIQUE,
                                                  tmdb_id INTEGER UNIQUE
            )`, (err) => {
        if (err) {
            console.error('Error creating Actors table:', err.message);
        } else {
            console.log('Table "Actors" created or already exists.');
        }
    });

    // Create the Movies table
    db.run(`CREATE TABLE IF NOT EXISTS Movies (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  title TEXT NOT NULL UNIQUE,
                                                  release_year INTEGER,
                                                  tmdb_id INTEGER UNIQUE
            )`, (err) => {
        if (err) {
            console.error('Error creating Movies table:', err.message);
        } else {
            console.log('Table "Movies" created or already exists.');
        }
    });

    // Create the Categories table
    db.run(`CREATE TABLE IF NOT EXISTS Categories (
                                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                      name TEXT NOT NULL UNIQUE
            )`, (err) => {
        if (err) {
            console.error('Error creating Categories table:', err.message);
        } else {
            console.log('Table "Categories" created or already exists.');
        }
    });

    // Create the Awards table
    db.run(`CREATE TABLE IF NOT EXISTS Awards (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  name TEXT NOT NULL,
                                                  year INTEGER NOT NULL,
                                                  UNIQUE(name, year)
            )`, (err) => {
        if (err) {
            console.error('Error creating Awards table:', err.message);
        } else {
            console.log('Table "Awards" created or already exists.');
        }
    });

    // Create the Nominations table
    db.run(`CREATE TABLE IF NOT EXISTS Nominations (
                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       award_id INTEGER NOT NULL,
                                                       category_id INTEGER NOT NULL,
                                                       movie_id INTEGER NOT NULL,
                                                       actor_id INTEGER, -- Allowed to be NULL
                                                       nominee_type TEXT NOT NULL, -- 'Actor' or 'Cast'
                                                       won BOOLEAN NOT NULL DEFAULT 0,
                                                       FOREIGN KEY (award_id) REFERENCES Awards(id),
                                                       FOREIGN KEY (category_id) REFERENCES Categories(id),
                                                       FOREIGN KEY (movie_id) REFERENCES Movies(id),
                                                       FOREIGN KEY (actor_id) REFERENCES Actors(id)
            )`, (err) => {
        if (err) {
            console.error('Error creating Nominations table:', err.message);
        } else {
            console.log('Table "Nominations" created or already exists.');
        }
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the database connection.');
});