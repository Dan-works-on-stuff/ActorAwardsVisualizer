document.addEventListener('DOMContentLoaded', () => {
    // Using a MutationObserver is more reliable than setTimeout to detect when the content is displayed.
    const observer = new MutationObserver((mutationsList) => {
        for(const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const adminContent = document.getElementById('admin-content');
                if (adminContent.style.display === 'flex') {
                    fetchAndDisplayData();
                    observer.disconnect(); // Stop observing once done
                    return;
                }
            }
        }
    });

    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
        observer.observe(adminContent, { attributes: true });
    }
});

function fetchAndDisplayData() {
    fetch('/api/reports') // Fetch from the new reports endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('admin-tbody');
            if (!tbody) {
                console.error('Table body not found!');
                return;
            }
            tbody.innerHTML = ''; // Clear existing rows

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;">No reports found.</td></tr>`;
                return;
            }

            data.forEach(report => {
                const row = document.createElement('tr');
                // Populate table with report ID and message
                row.innerHTML = `
                    <td>${report.id}</td>
                    <td>${report.message}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching report data:', error);
            const tbody = document.getElementById('admin-tbody');
            if (tbody) {
                // Colspan is 2 to match the number of columns
                tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;">Error loading data.</td></tr>`;
            }
        });
}