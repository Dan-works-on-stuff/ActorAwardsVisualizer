// Fetches movies and (optionally) awards for the actor
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

        if (data.error) {
            profileContainer.innerHTML = '';
            newsContainer.innerHTML = `<p>${data.error}</p>`;
            return;
        }

        // Render Profile Section
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
        } else {
            profileContainer.innerHTML = '';
        }

        // If results (movies) found, show them
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
            newsContainer.innerHTML = data.news.map(movie => `
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
        } else if (!data.error) {
            newsContainer.innerHTML = `<p>No movies or awards found for this person.</p>`;
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

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    fetchNews(query);
});

searchInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = searchInput.value.trim();
        fetchNews(query);
    }
});

// Optionally, load trending on page load
// fetchNews();
