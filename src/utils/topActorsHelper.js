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

    const exportCSV = () => {
        const dataToExport = currentData.slice(0, visibleItems);
        if (dataToExport.length === 0) {
            alert('No data to export.');
            return;
        }

        const header = `"${currentView === 'actors' ? 'Actor' : 'Movie'}","Nominations"\n`;
        const csvRows = dataToExport.map(item => {
            const name = item.name || item.title;
            return `"${name.replace(/"/g, '""')}",${item.nomination_count}`;
        });

        const csvString = header + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `top-${currentView}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportImage = (format) => {
        if (!currentChart) {
            alert('No chart to export.');
            return;
        }
        const mimeType = `image/${format}`;
        const canvas = currentChart.canvas;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);

        const dataUrl = tempCanvas.toDataURL(mimeType);
        const link = document.createElement('a');
        link.setAttribute('href', dataUrl);
        link.setAttribute('download', `top-${currentView}-chart.${format}`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    document.getElementById('exportCsv').addEventListener('click', exportCSV);
    document.getElementById('exportWebp').addEventListener('click', () => exportImage('webp'));
    document.getElementById('exportSvg').addEventListener('click', () => {
        alert('SVG export is not supported with the current chart library version. Please consider upgrading to a newer version of Chart.js for this feature.');
    });

    // Initial fetch
    fetchData('actors');
});