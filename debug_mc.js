const fs = require('fs');

global.Indicators = {};
const indicatorsCode = fs.readFileSync('./js/indicators.js', 'utf8');
eval(indicatorsCode);

// Mock OHLCV
const ohlcv = [];
let price = 100;
for(let i=0; i<300; i++) {
  price += (Math.random() - 0.5) * 5;
  ohlcv.push({
    time: '2025-01-01',
    open: price,
    high: price + 2,
    low: price - 2,
    close: price,
    volume: 1000000 * Math.random()
  });
}

const res = Indicators.calculateMCPredict(ohlcv);
console.log("Last 5 scores:");
for(let i=res.scores.length-5; i<res.scores.length; i++) {
   console.log(`Index ${i}: finalPrediction = ${res.scores[i].finalPrediction}`);
}
