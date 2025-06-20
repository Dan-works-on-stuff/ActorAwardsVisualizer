document.addEventListener('DOMContentLoaded', () => {
    let currentData = [];
    let currentChart = null;
    let visibleItems = 5;
    let currentView = 'actors'; // 'actors' or 'movies'

    const fetchData = (type) => {
        const url = type === 'actors' ? '/api/top-actors-stats' : '/api/top-movies-stats';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                currentData = data;
                visibleItems = 5;
                renderChart();
            })
            .catch(error => {
                console.error(`Error fetching top ${type} stats:`, error);
                alert(`Could not retrieve ${type} statistics.`);
            });
    };

    const renderChart = () => {
        const topData = currentData.slice(0, visibleItems);
        const labels = topData.map(item => item.name || item.title);
        const counts = topData.map(item => item.nomination_count);

        if (currentChart) {
            currentChart.destroy();
        }
        currentChart = renderVerticalBarChart(labels, counts);
    };

    const renderVerticalBarChart = (labels, data) => {
        const ctx = document.getElementById('topActorsChart').getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Nominations',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Top ${visibleItems} ${currentView.charAt(0).toUpperCase() + currentView.slice(1)} by Nominations`
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 45
                        }
                    }]
                }
            }
        });
    };

    document.getElementById('showActors').addEventListener('click', () => {
        currentView = 'actors';
        fetchData('actors');
    });

    document.getElementById('showMovies').addEventListener('click', () => {
        currentView = 'movies';
        fetchData('movies');
    });

    document.getElementById('showMore').addEventListener('click', () => {
        if (visibleItems < currentData.length) {
            visibleItems = Math.min(visibleItems + 5, currentData.length);
            renderChart();
        }
    });

    document.getElementById('showLess').addEventListener('click', () => {
        visibleItems = Math.max(5, visibleItems - 5);
        renderChart();
    });

    // Initial fetch
    fetchData('actors');
});