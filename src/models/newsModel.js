const https = require('https');
const config = require('../config'); // Import the centralized config
const TMDB_BEARER_TOKEN = config.tmdb.apiKey;
const TMDB_BASE_URL = 'api.themoviedb.org';

if (!TMDB_BEARER_TOKEN) {
    throw new Error('TMDB_KEY is not defined. Please ensure it is set in your .env file and loaded correctly in the config.');
}

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
        const personSummary = searchRes.results && searchRes.results[0];

        if (personSummary) {
            // Step 2: Fetch full details and movie credits in parallel
            const [personDetails, credits] = await Promise.all([
                fetchFromTMDB(`/3/person/${personSummary.id}`),
                fetchFromTMDB(`/3/person/${personSummary.id}/movie_credits`)
            ]);

            // Map movies
            const movies = (credits.cast || []).map(movie => ({
                title: movie.title || movie.original_title || movie.name,
                description: movie.character ? `as ${movie.character}` : '',
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '',
                url: movie.id ? `https://www.themoviedb.org/movie/${movie.id}` : ''
            }));

            // Calculate age
            let age = null;
            if (personDetails.birthday) {
                const birthDate = new Date(personDetails.birthday);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            const celebrityData = {
                name: personDetails.name,
                birthday: personDetails.birthday,
                age: age,
                place_of_birth: personDetails.place_of_birth,
                profile_path: personDetails.profile_path ? `https://image.tmdb.org/t/p/w400${personDetails.profile_path}` : null,
                profile_url: `https://www.themoviedb.org/person/${personDetails.id}`
            };

            return {
                celebrity: celebrityData,
                news: movies
            };
        } else {
            return {
                celebrity: null,
                news: [],
                error: `No celebrity found for "${query.trim()}".`
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
            celebrity: null, // No specific celebrity for trending
            news: items
        };
    }
}

module.exports = {
    fetchCelebrityNews
};