const path = require('path');
// Load .env file from the root of the project
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Export all the configuration
module.exports = {
  tmdb: {
    apiKey: process.env.TMDB_KEY,
  },
  server: {
    port: process.env.PORT || 3000,
  },
};