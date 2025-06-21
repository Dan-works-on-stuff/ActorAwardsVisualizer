document.addEventListener('DOMContentLoaded', () => {
    let winnersData = [];

    const fetchWinners = async () => {
        try {
            const response = await fetch('/api/winners');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            winnersData = await response.json();
            renderTable(winnersData);
        } catch (error) {
            console.error('Error fetching winners:', error);
            const tbody = document.getElementById('winners-tbody');
            tbody.innerHTML = '<tr><td colspan="3">Failed to load data.</td></tr>';
        }
    };

    const renderTable = (winners) => {
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
    };

    document.getElementById('exportCsv').addEventListener('click', () => {
        const headers = {
            name: 'Name',
            wins: 'Wins',
            nominations: 'Nominations'
        };
        exportDataAsCSV(winnersData, headers, 'award-winners.csv');
    });

    fetchWinners();
});