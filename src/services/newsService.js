const NewsAPI = require('newsapi');
// You'll need to sign up for a free API key at https://newsapi.org
const newsapi = new NewsAPI('5db3bf8e32fb4e3fa4a5d77ae4040310');

const celebrities = [
    'Tom Hanks',
    'Meryl Streep',
    'Leonardo DiCaprio',
    'Jennifer Lawrence',
    'Morgan Freeman',
    'Nicusor Dan'
];

async function getRandomCelebrityNews() {
    const randomCelebrity = celebrities[Math.floor(Math.random() * celebrities.length)];

    try {
        const response = await newsapi.v2.everything({
            q: randomCelebrity,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 5
        });

        return {
            celebrity: randomCelebrity,
            news: response.articles
        };
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
}

module.exports = {
    getRandomCelebrityNews
};