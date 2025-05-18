const newsService = require('../services/newsService');

async function getRandomCelebrityNews(req, res) {
    try {
        const news = await newsService.getRandomCelebrityNews();
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

module.exports = {
    getRandomCelebrityNews
};