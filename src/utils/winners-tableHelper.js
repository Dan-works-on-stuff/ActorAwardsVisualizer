async function fetchWinners() {
    try {
        const response = await fetch('/api/winners');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const winners = await response.json();
        const tbody = document.getElementById('winners-tbody');
        tbody.innerHTML = ''; // Clear existing data

        if (winners.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No winners found.</td></tr>';
            return;
        }

        winners.forEach(winner => {
            const row = `
                <tr>
                    <td>${winner.name}</td>
                    <td>${winner.wins}</td>
                    <td>${winner.nominations}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching winners:', error);
        const tbody = document.getElementById('winners-tbody');
        tbody.innerHTML = '<tr><td colspan="3">Failed to load data.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', fetchWinners);