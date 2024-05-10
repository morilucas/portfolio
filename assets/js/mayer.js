async function fetchAndDisplayMayerMultiple() {
    const crypto = document.getElementById('cryptoSelect').value;
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=230`;

    try {
        const response = await axios.get(apiUrl);
        const prices = response.data.prices; // Prices are [[timestamp, price], ...]
        const mayerMultiples = [];
        const labels = [];
        let currentMayerMultiple = 0;
        let currentPrice = 0;
        
        function formatUTCDate(date) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const year = date.getUTCFullYear().toString().slice(2); // Get last two digits of year
            const month = monthNames[date.getUTCMonth()]; // Get month as a string
            const day = date.getUTCDate().toString().padStart(2, '0'); // Ensure two-digit day
            return `${month}-${day}-${year}`; // Return formatted date
        }

        // Check that there are enough data points for analysis
        if (prices.length > 200) {
            for (let i = 200; i < prices.length; i++) {
                const slice = prices.slice(i - 200, i);
                const sum = slice.reduce((acc, p) => acc + p[1], 0);
                const movingAverage = sum / 200;
                const mayerMultiple = prices[i][1] / movingAverage;
                currentPrice = prices[i][1]; // Assigning only the price, not the timestamp
                if (i === prices.length - 1) {
                    currentMayerMultiple = mayerMultiple;
                }

                if (i >= prices.length - 30) {
                    mayerMultiples.push(mayerMultiple);
                    const date = new Date(prices[i][0]);
                    const formattedDate = formatUTCDate(date); // YYYY-MM-DD format
                    labels.push(formattedDate);
                }
            }
        }

        const ctx = document.getElementById('mayerChart').getContext('2d');
        if (window.myChart) {
            window.myChart.destroy(); // Destroy the old chart instance before creating a new one
        }
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mayer Multiple',
                    data: mayerMultiples,
                    borderColor: '#F8991D',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = '';
                                const mayerLabel = 'Mayer Multiple: ' + context.parsed.y.toFixed(2);
                                label += mayerLabel;
                                // Ensure we do not go out of bounds or reference incorrect data
                                const priceIndex = context.dataIndex + (prices.length - mayerMultiples.length);
                                const priceLabel = 'Price: $' + prices[priceIndex][1].toLocaleString('en-US', {maximumFractionDigits: 2});
                                label += '\n' + priceLabel;
                                return label;
                            }
                        }
                    }
                }
            }

        });

        document.getElementById('currentPrice').innerHTML = `Current Price: <strong>$${currentPrice.toLocaleString('en-US', {maximumFractionDigits: 2})}</strong>`;
        document.getElementById('currentMayer').innerHTML = `Current Mayer Multiple: <strong>${currentMayerMultiple.toFixed(2)}</strong>`;

    } catch (error) {
        console.error(`Error fetching ${crypto} prices:`, error);
        document.getElementById('currentPrice').innerText = 'Failed to load current price.';
        document.getElementById('currentMayer').innerText = 'Failed to load Mayer Multiple.';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cryptoParam = urlParams.get('crypto');
    if (cryptoParam) {
        document.getElementById('cryptoSelect').value = cryptoParam;
    }
    fetchAndDisplayMayerMultiple(); // Ensure the page is fully loaded before making API calls
});