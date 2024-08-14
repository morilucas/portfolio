// Load the CSV file
Papa.parse('https://raw.githubusercontent.com/morilucas/camel/main/aggregated_data.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;

        // Parse the Date and avg_price columns
        const labels = data.map(row => {
            const dateParts = row.Date.split('-');
            const parsedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

            // Check if the date is valid
            if (!isNaN(parsedDate)) {
                return parsedDate;
            } else {
                console.error("Invalid date encountered:", row.Date);
                return null;
            }
        }).filter(date => date !== null); // Filter out any null (invalid) dates

        const avgPrices = data.map(row => parseFloat(row.avg_price));

        // Check if labels array is empty or has unexpected values
        if (labels.length === 0) {
            console.error("No valid dates were found.");
            return;
        }

        // Get the first date in the dataset to set as the minimum value for the x-axis
        const minDate = new Date(Math.min(...labels));

        // Create the line chart
        const ctx = document.getElementById('linePlot').getContext('2d');
        const lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Price',
                    data: avgPrices,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day', // Change to 'day' to display days on the x-axis
                            tooltipFormat: 'yyyy-MM-dd', // Display format in tooltips
                            displayFormats: {
                                day: 'yyyy-MM-dd' // Display format on the x-axis
                            },
                            min: minDate // Set the minimum value for the x-axis
                        },
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
});
