document.addEventListener('DOMContentLoaded', () => {
    //debug
    console.log('//debug: Attempting to fetch /api/stats...');
    fetch('/api/stats')
        .then(response => {
            //debug
            console.log('//debug: Received response from /api/stats, status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(stats => {
            //debug
            console.log('//debug: Successfully fetched and parsed stats data.');
            const { bar } = stats;
            const ctx = document.getElementById('barChart');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: bar.xValues,
                    datasets: [{
                        backgroundColor: bar.colors,
                        data: bar.yValues
                    }]
                },
                options: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'World Wine Production 2018'
                    }
                }
            });
        })
        .catch(error => {
            //debug
            console.error('//debug: Error fetching or parsing stats data:', error);
        });
});