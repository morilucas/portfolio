// Load the CSV file
Papa.parse('https://raw.githubusercontent.com/morilucas/camel/main/aggregated_data.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;

        // Parse the Date and price columns
        const labels = data.map(row => {
            if (row.Date) {
                const dateParts = row.Date.split('-');
                const parsedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

                // Check if the date is valid
                if (!isNaN(parsedDate)) {
                    return parsedDate;
                }
            }
            console.error("Invalid or missing date encountered:", row.Date);
            return null;
        }).filter(date => date !== null); // Filter out any null (invalid) dates

        const avgPrices = data.map(row => {
            const price = parseFloat(row.avg_price);
            return !isNaN(price) ? price : null;
        }).filter(price => price !== null); // Filter out any invalid avg prices

        const minPrices = data.map(row => {
            const price = parseFloat(row.min_price);
            return !isNaN(price) ? price : null;
        }).filter(price => price !== null); // Filter out any invalid min prices

        const maxPrices = data.map(row => {
            const price = parseFloat(row.max_price);
            return !isNaN(price) ? price : null;
        }).filter(price => price !== null); // Filter out any invalid max prices

        // Check if any of the data arrays are empty
        if (labels.length === 0 || avgPrices.length === 0 || minPrices.length === 0 || maxPrices.length === 0) {
            console.error("No valid data found for plotting.");
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
                datasets: [
                    {
                        label: 'Average Price',
                        data: avgPrices,
                        borderColor: 'black', // Black color for average price line
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        fill: false,
                    },
                    {
                        label: 'Min Price',
                        data: minPrices,
                        borderColor: 'rgba(144, 238, 144, 1)', // Light green color for min price line
                        backgroundColor: 'rgba(144, 238, 144, 0.2)',
                        fill: false,
                        borderDash: [10, 5], // Make the line dashed
                    },
                    {
                        label: 'Max Price',
                        data: maxPrices,
                        borderColor: 'rgba(255, 182, 193, 1)', // Light red color for max price line
                        backgroundColor: 'rgba(255, 182, 193, 0.2)',
                        fill: false,
                        borderDash: [10, 5], // Make the line dashed
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day', // Display days on the x-axis
                            tooltipFormat: 'yyyy-MM-dd', // Tooltip format
                            displayFormats: {
                                day: 'yyyy-MM-dd' // X-axis label format
                            },
                            min: minDate // Set the minimum value for the x-axis
                        },
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price'
                        }
                    }
                }
            }
        });
    }
});
