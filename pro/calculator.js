// calculator.js
function calculateForecast() {
    const title = document.getElementById('calculationTitle').value;
    const input = document.getElementById('prices').value;
    const prices = input.split(',').map(Number);
    
    if (prices.length !== 5 || prices.some(isNaN)) {
        alert("Пожалуйста, введите 5 чисел, разделённых запятыми.");
        return;
    }

    const mean = math.mean(prices);
    const stdDev = math.std(prices);
    
    const targetPrice = prices[4];
    const predictedPrice = mean;
    const probabilityAboveTarget = 1 - math.erf((targetPrice - mean) / (stdDev * Math.sqrt(2))) / 2;

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h2>${title}</h2>
        <p>Предсказанная цена: <strong>${predictedPrice.toFixed(2)}</strong></p>
        <p>Вероятность того что прогноз сбудется относительно последней цены ${targetPrice}: <strong>${(probabilityAboveTarget * 100).toFixed(2)}%</strong></p>
    `;
}
