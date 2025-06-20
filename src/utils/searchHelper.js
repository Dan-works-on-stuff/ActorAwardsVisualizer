// Global state to hold data from the initial search
let celebrityName = '';
let moviesData = [];

/**
 * Renders movie cards in the news container.
 * @param {Array} movies - Array of movie objects.
 */
function renderMovies(movies) {
    const newsContainer = document.getElementById('news-container');
    if (movies && movies.length > 0) {
        newsContainer.innerHTML = movies.map(movie => `
            <div class="movie-card">
                <a href="${movie.url}" target="_blank">
                    ${movie.poster ? `<img src="${movie.poster}" alt="${movie.title} poster" />` : '<div class="no-poster">No Poster</div>'}
                    <div class="movie-info">
                         <h3>${movie.title}</h3>
                         <p>${movie.description || ''}</p>
                    </div>
                </a>
            </div>
        `).join('');
    } else {
        newsContainer.innerHTML = `<p>No movies found for this person.</p>`;
    }
}

/**
 * Fetches news from GNews API and renders them.
 * @param {string} name - The name of the celebrity to search for.
 */
async function fetchAndRenderGNews(name) {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<p>Loading news...</p>';
    try {
        const response = await fetch(`/api/gnews?query=${encodeURIComponent(name)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const gnewsData = await response.json();

        if (gnewsData.articles && gnewsData.articles.length > 0) {
            newsContainer.innerHTML = gnewsData.articles.map(article => `
                <div class="news-article-card">
                    <a href="${article.url}" target="_blank">
                        ${article.image ? `<img src="${article.image}" alt="${article.title}" />` : ''}
                        <div class="article-info">
                            <h3>${article.title}</h3>
                            <p>${article.description || ''}</p>
                            <span>Source: ${article.source.name}</span>
                        </div>
                    </a>
                </div>
            `).join('');
        } else {
            newsContainer.innerHTML = '<p>No news articles found.</p>';
        }
    } catch (error) {
        console.error('Error fetching GNews:', error);
        newsContainer.innerHTML = '<p>Error loading news. Please try again.</p>';
    }
}


// Fetches celebrity profile and movies from TMDB
async function fetchNews(query = '') {
    try {
        const apiUrl = query
            ? `/api/celebrity-news?query=${encodeURIComponent(query)}`
            : '/api/celebrity-news';

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const profileContainer = document.getElementById('profile-container');
        const newsContainer = document.getElementById('news-container');
        const toggleContainer = document.getElementById('view-toggle-container');
        const viewToggle = document.getElementById('view-toggle');

        // Clear previous results and state
        profileContainer.innerHTML = '';
        newsContainer.innerHTML = '';
        toggleContainer.style.display = 'none';
        celebrityName = '';
        moviesData = [];

        if (data.error) {
            newsContainer.innerHTML = `<p>${data.error}</p>`;
            return;
        }

        // Render Profile Section if a celebrity is found
        if (data.celebrity && typeof data.celebrity === 'object' && data.celebrity.name) {
            profileContainer.innerHTML = `
                <div class="profile-section">
                    ${data.celebrity.profile_path ? `<img src="${data.celebrity.profile_path}" alt="${data.celebrity.name}" class="profile-picture">` : ''}
                    <div class="profile-details">
                        <h2><a href="${data.celebrity.profile_url}" target="_blank">${data.celebrity.name}</a></h2>
                        <p><strong>Born:</strong> ${data.celebrity.birthday || 'N/A'} (age ${data.celebrity.age || 'N/A'})</p>
                        <p><strong>Place of Birth:</strong> ${data.celebrity.place_of_birth || 'N/A'}</p>
                    </div>
                </div>
            `;
            // Store data, show toggle, and render initial movie view
            celebrityName = data.celebrity.name;
            moviesData = data.news;
            toggleContainer.style.display = 'flex';
            viewToggle.checked = false; // Default to "Movies Starred"
            renderMovies(moviesData);

        } else {
            // If no specific celebrity, it's trending data, so just show it
            renderMovies(data.news);
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('profile-container').innerHTML = '';
        document.getElementById('news-container').innerHTML =
            '<p>Error loading data. Please try again.</p>';
    }
}

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const viewToggle = document.getElementById('view-toggle');

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) fetchNews(query);
});

searchInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (query) fetchNews(query);
    }
});

viewToggle.addEventListener('change', (event) => {
    if (event.target.checked) { // "News" is selected
        fetchAndRenderGNews(celebrityName);
    } else { // "Movies Starred" is selected
        renderMovies(moviesData);
    }
});