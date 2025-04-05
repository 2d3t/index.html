// calculator.js
function calculateForecast() {
    const title = document.getElementById('calculationTitle').value;
    const input = document.getElementById('prices').value;
    const prices = input.split(',').map(Number);
    
    // Check if there are any valid numbers
    if (prices.length === 0 || prices.some(isNaN)) {
        alert("Пожалуйста, введите хотя бы одно число, разделённое запятыми.");
        return;
    }

    const mean = math.mean(prices);
    const stdDev = math.std(prices);
    
    // Use the last price as the target price
    const targetPrice = prices[prices.length - 1];
    const predictedPrice = mean;

    // Calculate the probability only if stdDev is greater than 0
    let probabilityAboveTarget = 0;
    if (stdDev > 0) {
        probabilityAboveTarget = 1 - math.erf((targetPrice - mean) / (stdDev * Math.sqrt(2))) / 2;
    }

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h2>${title}</h2>
        <p>Предсказанная цена: <strong>${predictedPrice.toFixed(2)}</strong></p>
        <p>Вероятность того что прогноз сбудется относительно последней цены ${targetPrice}: <strong>${(probabilityAboveTarget * 100).toFixed(2)}%</strong></p>
    `;
}
