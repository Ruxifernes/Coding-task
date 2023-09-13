
const cryptoTable = document.querySelector(".table-body");
const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h%2C7d&locale=en";

const chartData = {
    labels: [],
    datasets: [{
        label: 'Price (USD)',
        borderColor: [],
        data: [],
        fill: false,
    }],
};

const ctx = document.getElementById('price-chart').getContext('2d');
const priceChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    },
});

function fetchData() {
    axios.get(apiUrl)
        .then(response => {
            const cryptoData = response.data;

           
            cryptoTable.innerHTML = "";
            chartData.labels = [];
            chartData.datasets[0].data = [];
            chartData.datasets[0].borderColor = [];

            cryptoData.forEach(async crypto => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table-data">
                        <button class="add-to-fav" aria-label="Add to favourite" data-add-to-fav>
                            <ion-icon name="star-outline" aria-hidden="true" class="icon-outline"></ion-icon>
                            <ion-icon name="star" aria-hidden="true" class="icon-fill"></ion-icon>
                        </button>
                    </td>
                    <th class="table-data rank" scope="row">${crypto.market_cap_rank}</th>
                    <td class="table-data">
                        <div class="wrapper">
                            <img src="${crypto.image}" alt="${crypto.name} logo" class="coded-logo">
                            <h3>
                                <a href="#" class="coin-name">${crypto.name} <span class="span">${crypto.symbol.toUpperCase()}</span></a>
                            </h3>
                        </div>
                    </td>
                    <td class="table-data last-price">$${crypto.current_price.toFixed(2)}</td>
                    <td class="table-data last-update ${crypto.price_change_percentage_24h >= 0 ? 'green' : 'red'}">${crypto.price_change_percentage_24h.toFixed(2)}%</td>
                    <td class="table-data market-cap">$${crypto.market_cap.toLocaleString()}</td>
                    <td class="table-data chart-container">
                        <canvas class="price-chart" data-symbol="${crypto.symbol}"></canvas>
                        </td>
                        <td class="table-data">
                            <button class="btn btn-outline">Trade</button>
                            </td>
                `;

               
                let lineColor = crypto.price_change_percentage_24h >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';

                chartData.labels.push(crypto.name);
                chartData.datasets[0].data.push(crypto.current_price);
                chartData.datasets[0].borderColor.push(lineColor);

                cryptoTable.appendChild(row);

             
                await createLineChart(row.querySelector(".price-chart"), crypto.name, crypto.symbol, lineColor);
                updateLineChart(row.querySelector(".price-chart"), crypto.sparkline_in_7d);
            });

            priceChart.update();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

async function createLineChart(canvas, name, symbol, lineColor) {
    const ctx = canvas.getContext("2d");
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], 
            datasets: [
                {
                    label: `${name} (${symbol})`,
                    data: [], 
                    borderColor: lineColor,
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

   
    canvas.chart = chart;
}

function updateLineChart(canvas, sparklineData) {
    if (!sparklineData || !canvas.chart) {
        return;
    }

    const chart = canvas.chart;
    const labels = [...Array(sparklineData.length).keys()]; 
    chart.data.labels = labels;
    chart.data.datasets[0].data = sparklineData;
    chart.update();
}


fetchData();
setInterval(fetchData, 160000);
