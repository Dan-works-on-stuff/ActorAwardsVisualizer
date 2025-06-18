const https = require('https');
const TMDB_BEARER_TOKEN = process.env.TMDB_KEY
const TMDB_BASE_URL = 'api.themoviedb.org';

function fetchFromTMDB(path, params = {}) {
    const query = new URLSearchParams({ language: 'en-US', ...params }).toString();
    const options = {
        hostname: TMDB_BASE_URL,
        path: `${path}?${query}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function fetchCelebrityNews(query = '') {
    if (query && query.trim() !== '') {
        // Step 1: Search for the person
        const searchRes = await fetchFromTMDB('/3/search/person', { query: query.trim(), page: 1 });
        const person = searchRes.results && searchRes.results[0];
        if (person) {
            // Step 2: Fetch their movie credits
            const credits = await fetchFromTMDB(`/3/person/${person.id}/movie_credits`);
            // Map to frontend format
            const movies = (credits.cast || []).map(movie => ({
                title: movie.title || movie.original_title || movie.name,
                description: movie.character ? `as ${movie.character}` : '',
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '',
                url: movie.id ? `https://www.themoviedb.org/movie/${movie.id}` : ''
            }));
            return {
                celebrity: person.name,
                news: movies
            };
        } else {
            return {
                celebrity: query.trim(),
                news: [],
                error: `No movies or awards found for "${query.trim()}".`
            };
        }
    } else {
        // Trending as fallback
        const trending = await fetchFromTMDB('/3/trending/all/day', { page: 1 });
        const items = (trending.results || []).map(item => ({
            title: item.title || item.name,
            description: item.overview || '',
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '',
            url: item.id ? `https://www.themoviedb.org/${item.media_type}/${item.id}` : ''
        }));
        return {
            celebrity: '',
            news: items
        };
    }
}

module.exports = {
    fetchCelebrityNews
};