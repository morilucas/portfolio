async function fetchBitcoinPrices() {
    const startDate = new Date('2024-05-09');
    const today = new Date();
    const timeDifference = today - startDate;
    const days = Math.ceil(timeDifference / (1000 * 3600 * 24));
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data.prices.map(priceEntry => ({
        date: new Date(priceEntry[0]).toISOString().slice(0, 10), // Date in YYYY-MM-DD format
        price: priceEntry[1]
    }));
}

async function fetchCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function parseCSVData(csv) {
    const lines = csv.trim().split('\n');
    const labels = [];
    const sentimentData = [];
    const header = lines[0].split(',');
    const dateIndex = header.indexOf('date_scraped');
    const sentimentIndex = header.indexOf('average_sentiment');

    if (dateIndex === -1 || sentimentIndex === -1) {
        console.error('Column names not found in CSV header');
        return { labels, sentimentData };
    }

    for (let i = 1; i < lines.length; i++) {
        const elements = lines[i].split(',');
        const formattedDate = elements[dateIndex].trim();
        labels.push(formattedDate);
        sentimentData.push(parseFloat(elements[sentimentIndex]));
    }
    return { labels, sentimentData };
}

async function plotGraph() {
    const sentimentURL = 'https://raw.githubusercontent.com/morilucas/crypto_news/master/mean_and_count_per_day.csv';
    const sentimentData = await fetchCSV(sentimentURL);
    const { labels, sentimentData: data } = parseCSVData(sentimentData);
    const bitcoinPrices = await fetchBitcoinPrices();

    const priceData = bitcoinPrices.map(entry => {
        const index = labels.indexOf(entry.date);
        return index !== -1 ? entry.price : null;
    });

    const ctx = document.getElementById('sentimentChart').getContext('2d');
    const sentimentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Sentiment',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'Bitcoin Price (USD)',
                data: priceData,
                backgroundColor: 'rgba(255, 165, 0, 0.2)',
                borderColor: 'rgba(255, 165, 0, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Sentiment'
                    }
                },
                y1: {
                    beginAtZero: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    },
                    grid: {
                        drawOnChartArea: false // only draw grid for y axis
                    }
                }
            }
        }
    });
}

plotGraph();
