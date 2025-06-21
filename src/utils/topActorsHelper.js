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
                    backgroundColor: 'rgba(170, 210, 186, 0.6)',
                    borderColor: '#b9f5d8',
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
                    text: `Top ${visibleItems} ${currentView.charAt(0).toUpperCase() + currentView.slice(1)} by Nominations`,
                    fontColor: '#b9f5d8',
                    fontSize: 16
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1,
                            fontColor: '#aad2ba'
                        },
                        gridLines: {
                            color: 'rgba(170, 210, 186, 0.2)'
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 45,
                            fontColor: '#aad2ba'
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        });
    };

    // Event Listeners
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

    document.getElementById('exportCsv').addEventListener('click', () => {
        const headers = {
            [currentView === 'actors' ? 'name' : 'title']: currentView === 'actors' ? 'Actor' : 'Movie',
            nomination_count: 'Nominations'
        };
        const filename = `top-${currentView}.csv`;
        exportDataAsCSV(currentData.slice(0, visibleItems), headers, filename);
    });

    document.getElementById('exportWebp').addEventListener('click', () => {
        const filename = `top-${currentView}-chart.webp`;
        exportChartAsImage(currentChart, 'webp', filename);
    });

    document.getElementById('exportSvg').addEventListener('click', () => {
        const filename = `top-${currentView}-chart.svg`;
        exportChartAsSVG(currentChart, filename);
    });

    // Initial fetch
    fetchData('actors');
});