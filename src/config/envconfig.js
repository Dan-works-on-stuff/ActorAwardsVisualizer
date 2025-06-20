require('dotenv').config();

const config = {
    tmdb: {
        apiKey: process.env.TMDB_KEY
    },
    gnews: {
        apiKey: process.env.GNEWS_KEY
    }
};

module.exports = config;