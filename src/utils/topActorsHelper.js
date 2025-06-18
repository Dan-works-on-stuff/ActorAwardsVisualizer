document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/top-actors-stats')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Limit to the top 20 actors for better readability
            const topData = data.slice(0, 20);

            // For a vertical chart, we don't need to reverse the data.
            const labels = topData.map(actor => actor.name);
            const counts = topData.map(actor => actor.nomination_count);

            renderVerticalBarChart(labels, counts);
        })
        .catch(error => {
            console.error('Error fetching top actors stats:', error);
            alert('Could not retrieve actor statistics.');
        });
});

function renderVerticalBarChart(labels, data) {
    const ctx = document.getElementById('topActorsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // Change chart type to vertical 'bar'
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
            maintainAspectRatio: false, // Allows chart to fill the container height
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Top 20 Actors by Nominations in the Last 10 Years'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1 // Ensures y-axis ticks are whole numbers
                    }
                }],
                xAxes: [{
                    ticks: {
                        autoSkip: false, // Show all labels
                        maxRotation: 90, // Rotate labels to prevent overlap
                        minRotation: 45
                    }
                }]
            }
        }
    });
}