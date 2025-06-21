document.addEventListener('DOMContentLoaded', () => {
    let currentChart = null;
    let currentData = [];
    let currentEntityName = '';

    const entityInput = document.getElementById('entityInput');
    const searchButton = document.getElementById('searchButton');

    const fetchData = (entityName) => {
        if (!entityName) return;
        currentEntityName = entityName;
        const url = `/api/category-stats?entity=${encodeURIComponent(entityName)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                currentData = data;
                renderChart(data);
            })
            .catch(error => {
                console.error('Error fetching category stats:', error);
                alert('Could not retrieve category statistics.');
            });
    };

    const renderChart = (data) => {
        const labels = data.map(item => item.category);
        const counts = data.map(item => item.nomination_count);

        if (currentChart) {
            currentChart.destroy();
        }
        currentChart = renderPieChart(labels, counts);
    };

    const renderPieChart = (labels, data) => {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        const backgroundColors = ['rgba(185, 245, 216, 0.7)', 'rgba(103, 199, 167, 0.7)', 'rgba(46, 139, 87, 0.7)', 'rgba(153, 226, 180, 0.7)', 'rgba(29, 89, 57, 0.7)', 'rgba(117, 201, 183, 0.7)', 'rgba(136, 216, 176, 0.7)', 'rgba(69, 179, 157, 0.7)', 'rgba(42, 125, 79, 0.7)', 'rgba(14, 54, 33, 0.7)'];
        const borderColors = Array(10).fill('transparent');

        const getContrastingColor = (color) => {
            const rgb = color.match(/\d+/g);
            if (!rgb) return '#052515';
            const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
            return luminance > 140 ? '#052515' : '#FFFFFF';
        };

        return new Chart(ctx, {
            type: 'pie',
            data: { labels, datasets: [{ label: 'Nominations by Category', data, backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 1 }] },
            options: {
                maintainAspectRatio: false,
                title: { display: true, text: `Nominations by Category for ${currentEntityName}`, fontColor: '#b9f5d8', fontSize: 18 },
                legend: { display: true, position: 'right', labels: { fontColor: '#aad2ba' } },
                plugins: {
                    datalabels: {
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                            const percentage = (value / total * 100).toFixed(1) + '%';
                            return (value / total) < 0.03 ? '' : percentage;
                        },
                        color: (context) => getContrastingColor(context.dataset.backgroundColor[context.dataIndex]),
                        font: { weight: 'bold', size: 12 },
                        textAlign: 'center'
                    }
                }
            }
        });
    };

    searchButton.addEventListener('click', () => {
        fetchData(entityInput.value);
    });

    entityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchButton.click();
        }
    });

    document.getElementById('exportCsv').addEventListener('click', () => {
        const headers = { category: 'Category', nomination_count: 'Nominations' };
        const filename = `${currentEntityName}-category-stats.csv`;
        exportDataAsCSV(currentData, headers, filename);
    });

    document.getElementById('exportWebp').addEventListener('click', () => {
        const filename = `${currentEntityName}-category-chart.webp`;
        exportChartAsImage(currentChart, 'webp', filename);
    });

    document.getElementById('exportSvg').addEventListener('click', () => {
        const filename = `${currentEntityName}-category-chart.svg`;
        exportChartAsSVG(currentChart, filename);
    });
});