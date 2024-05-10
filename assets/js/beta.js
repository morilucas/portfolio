function getPriceChanges(cryptoSymbol, days, callback) {
    console.log("Fetching data for range:", days, "days");
    const url = "https://api.coingecko.com/api/v3/coins/";
    const params = {
        vs_currency: "usd",
        days: days,
        interval: "daily"
    };
    const fullUrl = `${url}${cryptoSymbol}/market_chart?${new URLSearchParams(params)}`;
    console.log("API request URL:", fullUrl);
    fetch(fullUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data for ${cryptoSymbol}.`);
            }
            return response.json();
        })
        .then(data => {
            const prices = data.prices;
            const startDate = new Date(prices[0][0]).toLocaleDateString();
            const endDate = new Date(prices[prices.length - 1][0]).toLocaleDateString();
            document.getElementById('dateRange').textContent = `Date Range: ${startDate} - ${endDate}`;
            const priceChanges = [];
            for (let i = 1; i < prices.length; i++) {
                const prevPrice = prices[i - 1][1];
                const currentPrice = prices[i][1];
                const priceChangePercent = ((currentPrice - prevPrice) / prevPrice) * 100;
                priceChanges.push(parseFloat(priceChangePercent.toFixed(2)));
            }
            callback(priceChanges);
        })
        .catch(error => {
            console.error(`Error fetching data for ${cryptoSymbol}:`, error);
            document.getElementById('dateRange').textContent = "Error fetching date range.";
            callback([]);
        });
}

function createScatterPlot(bitcoinPriceChanges, altcoinPriceChanges) {
    const ctx = document.getElementById('scatterPlot').getContext('2d');
    const dataPairs = bitcoinPriceChanges.map((x, index) => [x, altcoinPriceChanges[index]]);
    const regressionLine = ss.linearRegression(dataPairs);
    const regressionLinePoints = bitcoinPriceChanges.map((_, index) => {
        const x = bitcoinPriceChanges[index];
        const y = regressionLine.m * x + regressionLine.b;
        return { x, y };
    });

    // Displaying the slope
    document.getElementById('slopeDisplay').textContent = `${regressionLine.m.toFixed(2)}`;

    const correlationCoefficient = ss.sampleCorrelation(bitcoinPriceChanges, altcoinPriceChanges);
    const rSquared = correlationCoefficient ** 2;
    document.getElementById('linearEquation').textContent = `Lin. Equation: y = ${regressionLine.m.toFixed(2)}x + ${regressionLine.b.toFixed(2)}, R Squared: ${rSquared.toFixed(2)} `;

    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    const chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Price Changes (%) Bitcoin, Selected Altcoin',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: bitcoinPriceChanges.map((priceChange, index) => ({ x: priceChange, y: altcoinPriceChanges[index] })),
            }, {
                label: 'Linear Regression',
                borderColor: 'rgba(54, 162, 235, 1)',
                data: regressionLinePoints,
                type: 'line',
                fill: false,
                showLine: true,
                pointRadius: 0, 
                pointHoverRadius: 0 
            }]
        },
        options: {
            responsive: true, // Ensure the chart sizes down/up appropriately for the container
            maintainAspectRatio: false, // Remove aspect ratio maintenance to fill container height
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    type: 'linear',
                    position: 'left'
                }
            }
        }
    });

    window.chartInstance = chart;
}

function updatePlot() {
    const cryptoDropdown = document.getElementById('cryptoDropdown');
    const selectedCrypto = cryptoDropdown.value;

    getPriceChanges("bitcoin", 365, bitcoinPriceChanges => {
        if (bitcoinPriceChanges.length === 0) {
            console.error('Failed to fetch data for Bitcoin.');
            return;
        }
        getPriceChanges(selectedCrypto, 365, altcoinPriceChanges => {
            if (altcoinPriceChanges.length === 0) {
                console.error(`Failed to fetch data for ${selectedCrypto}.`);
                return;
            }
            createScatterPlot(bitcoinPriceChanges, altcoinPriceChanges);
        });
    });
}

updatePlot();
