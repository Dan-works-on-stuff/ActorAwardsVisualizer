const NewsAPI = require('newsapi');
// You'll need to sign up for a free API key at https://newsapi.org
const newsapi = new NewsAPI('5db3bf8e32fb4e3fa4a5d77ae4040310');
// This list is no longer strictly needed for random news,
// but could potentially be used as suggestions or fallback.
// const celebrities = [
//     'Tom Hanks',
//     'Meryl Streep',
//     'Leonardo DiCaprio',
//     'Jennifer Lawrence',
//     'Morgan Freeman',
//     'Nicusor Dan' // Assuming this is a relevant public figure you want news about
// ];

/**
 * Fetches celebrity news.
 * If a query is provided, searches for news about that celebrity.
 * If no query is provided, fetches the latest general celebrity/entertainment news.
 * @param {string} query - Optional celebrity name or search term.
 * @returns {Promise<{celebrity: string, news: Array}>} - An object containing the celebrity/topic name and an array of news articles.
 */
async function fetchCelebrityNews(query = '') {
    let newsQuery;
    let celebrityName;

    if (query && query.trim() !== '') {
        // If a query is provided and not just whitespace, search for that query
        newsQuery = query.trim();
        celebrityName = `News about ${query.trim()}`; // Label for the frontend
    } else {
        // If no query (or empty query), fetch latest general celebrity/entertainment news
        // Using a broad query on the 'everything' endpoint sorted by date
        newsQuery = 'celebrity OR entertainment';
        celebrityName = 'Latest Celebrity News'; // Label for the frontend
    }

    try {
        const response = await newsapi.v2.everything({
            q: newsQuery, // Use the determined query
            language: 'en', // Assuming English news
            sortBy: 'publishedAt', // Sort by latest
            pageSize: 10 // Fetch a reasonable number of articles (e.g., 10)
        });

        // Check if articles were returned
        if (response?.articles){
            return {
                celebrity: celebrityName,
                news: response.articles
            };
        } else {
            // Return empty news array if no articles are found
            console.log(`No articles found for query: "${newsQuery}"`);
            return {
                celebrity: celebrityName, // Still return the requested celebrity/topic label
                news: []
            };
        }


    } catch (error) {
        console.error(`Error fetching news for query "${newsQuery}":`, error);
        // Rethrow the error so the calling route can handle it
        throw error;
    }
}

// Export the new function
module.exports = {
    fetchCelebrityNews
};