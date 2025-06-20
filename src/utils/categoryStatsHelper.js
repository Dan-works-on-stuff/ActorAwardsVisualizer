document.addEventListener('DOMContentLoaded', () => {
    let currentChart = null;

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
        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nominations by Category',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Nominations by Category'
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