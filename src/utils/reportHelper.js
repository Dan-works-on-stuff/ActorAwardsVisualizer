document.addEventListener('DOMContentLoaded', () => {
    const reportButton = document.getElementById('reportButton');
    if (reportButton) {
        reportButton.addEventListener('click', () => {
            const message = prompt('Please enter your report message:');
            if (message) {
                fetch('/api/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message })
                })
                    .then(response => {
                        if (response.ok) {
                            alert('Report submitted successfully!');
                        } else {
                            alert('Failed to submit report.');
                        }
                    })
                    .catch(error => {
                        console.error('Error submitting report:', error);
                        alert('An error occurred while submitting the report.');
                    });
            }
        });
    }
});