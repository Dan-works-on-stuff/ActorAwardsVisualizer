document.addEventListener('DOMContentLoaded', () => {
    let currentChart = null;

    const entityInput = document.getElementById('entityInput');

    entityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            // Prevent the default action, e.g., form submission
            event.preventDefault();
            // Trigger the search button click
            document.getElementById('searchButton').click();
        }
    });

    const fetchData = (entityName) => {
        const url = `/api/category-stats?entity=${encodeURIComponent(entityName)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
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
        // A more distinct color palette with mostly greens and one teal
        const backgroundColors = [
            'rgba(185, 245, 216, 0.7)', // light mint
            'rgba(103, 199, 167, 0.7)', // medium green
            'rgba(46, 139, 87, 0.7)',   // sea green
            'rgba(153, 226, 180, 0.7)', // light green
            'rgba(29, 89, 57, 0.7)',    // dark green
            'rgba(117, 201, 183, 0.7)', // teal
            'rgba(136, 216, 176, 0.7)', // medium mint
            'rgba(69, 179, 157, 0.7)',  // turquoise-green
            'rgba(42, 125, 79, 0.7)',   // forest green
            'rgba(14, 54, 33, 0.7)'     // very dark green
        ];
        const borderColors = [
            'transparent', 'transparent', 'transparent', 'transparent',
            'transparent', 'transparent', 'transparent', 'transparent',
            'transparent', 'transparent'
        ];

        // Helper to determine a readable contrasting color (dark green or white)
        const getContrastingColor = (color) => {
            const rgb = color.match(/\d+/g);
            if (!rgb) return '#052515'; // Default to dark green
            // Calculate luminance to determine if the color is light or dark
            const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
            // Use white for dark backgrounds, and dark green for light backgrounds
            return luminance > 140 ? '#052515' : '#FFFFFF';
        };

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nominations by Category',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 25,
                        right: 30
                    }
                },
                title: {
                    display: true,
                    text: 'Nominations by Category',
                    fontColor: '#b9f5d8',
                    fontSize: 18
                },
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        fontColor: '#aad2ba'
                    },
                    // padding: {
                    //
                    // }
                },
                tooltips: {
                    enabled: false
                },
                plugins: {
                    datalabels: {
                        formatter: (value, ctx) => {
                            const datapoints = ctx.chart.data.datasets[0].data;
                            const total = datapoints.reduce((total, datapoint) => total + datapoint, 0);
                            const percentage = (value / total * 100).toFixed(1) + '%';
                            if ((value / total) < 0.03) {
                                return '';
                            }
                            return percentage;
                        },
                        color: (context) => {
                            const bgColor = context.dataset.backgroundColor[context.dataIndex];
                            return getContrastingColor(bgColor);
                        },
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                        textAlign: 'center'
                    }
                }
            }
        });
    };

    document.getElementById('searchButton').addEventListener('click', () => {
        const entityName = document.getElementById('entityInput').value;
        if (entityName) {
            fetchData(entityName);
        }
    });
});