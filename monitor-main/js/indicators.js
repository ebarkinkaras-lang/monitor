/**
 * TürkiyeMonitor — Pine Script Translated Indicator Engine
 * Built to support MC-Predict HullMA and MACD DEMA Pro
 */

const Indicators = (() => {

  // ==========================================
  // BASIC HELPERS
  // ==========================================

  function sma(data, period) {
    const result = new Array(data.length).fill(NaN);
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      let valid = true;
      for (let j = 0; j < period; j++) {
        if (isNaN(data[i - j])) {
          valid = false;
          break;
        }
        sum += data[i - j];
      }
      if (valid) {
        result[i] = sum / period;
      }
    }
    return result;
  }

  function ema(data, period) {
    const result = new Array(data.length).fill(NaN);
    const k = 2 / (period + 1);
    let currentEma = NaN;
    
    // Find first valid data point
    let startIndex = 0;
    while (startIndex < data.length && isNaN(data[startIndex])) {
      startIndex++;
    }

    if (startIndex + period - 1 < data.length) {
      // Calculate initial SMA
      let sum = 0;
      for (let i = startIndex; i < startIndex + period; i++) {
        sum += data[i];
      }
      currentEma = sum / period;
      result[startIndex + period - 1] = currentEma;

      // Apply EMA formula
      for (let i = startIndex + period; i < data.length; i++) {
        if (!isNaN(data[i])) {
          currentEma = (data[i] - currentEma) * k + currentEma;
          result[i] = currentEma;
        }
      }
    }
    return result;
  }

  function wma(data, period) {
    const result = new Array(data.length).fill(NaN);
    const norm = (period * (period + 1)) / 2;
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        const weight = period - j;
        sum += data[i - j] * weight;
      }
      result[i] = sum / norm;
    }
    return result;
  }

  function rma(data, period) {
    const result = new Array(data.length).fill(NaN);
    const alpha = 1 / period;
    let current = NaN;
    
    let startIndex = 0;
    while(startIndex < data.length && isNaN(data[startIndex])) startIndex++;

    if (startIndex + period - 1 < data.length) {
      let sum = 0;
      for (let i = startIndex; i < startIndex + period; i++) {
        sum += data[i];
      }
      current = sum / period;
      result[startIndex + period - 1] = current;

      for (let i = startIndex + period; i < data.length; i++) {
        current = alpha * data[i] + (1 - alpha) * current;
        result[i] = current;
      }
    }
    return result;
  }

  function trueRange(high, low, close) {
    const result = new Array(high.length).fill(NaN);
    result[0] = high[0] - low[0];
    for (let i = 1; i < high.length; i++) {
      const hl = high[i] - low[i];
      const hc = Math.abs(high[i] - close[i - 1]);
      const lc = Math.abs(low[i] - close[i - 1]);
      result[i] = Math.max(hl, hc, lc);
    }
    return result;
  }

  function atr(high, low, close, period) {
    const tr = trueRange(high, low, close);
    // Pine Script ATR uses RMA of True Range
    return rma(tr, period);
  }

  // ==========================================
  // COMPLEX INDICATORS
  // ==========================================

  function rsi(data, period) {
    const result = new Array(data.length).fill(NaN);
    const changes = new Array(data.length).fill(0);
    for (let i = 1; i < data.length; i++) {
      changes[i] = data[i] - data[i - 1];
    }
    
    let gains = new Array(data.length).fill(0);
    let losses = new Array(data.length).fill(0);
    for (let i = 1; i < data.length; i++) {
      gains[i] = Math.max(0, changes[i]);
      losses[i] = Math.max(0, -changes[i]);
    }
    
    const avgGain = rma(gains, period);
    const avgLoss = rma(losses, period);
    
    for (let i = period; i < data.length; i++) {
      if (avgLoss[i] === 0) {
        result[i] = 100;
      } else {
        const rs = avgGain[i] / avgLoss[i];
        result[i] = 100 - (100 / (1 + rs));
      }
    }
    return result;
  }

  function macd(data, fast, slow, signal) {
    const emaFast = ema(data, fast);
    const emaSlow = ema(data, slow);
    const macdLine = new Array(data.length).fill(NaN);
    for (let i = 0; i < data.length; i++) {
      macdLine[i] = emaFast[i] - emaSlow[i];
    }
    const signalLine = ema(macdLine, signal);
    const histogram = new Array(data.length).fill(NaN);
    for (let i = 0; i < data.length; i++) {
      histogram[i] = macdLine[i] - signalLine[i];
    }
    return { macdLine, signalLine, histogram };
  }

  function stoch(close, high, low, kPeriod, dPeriod, smooth) {
    const kRaw = new Array(close.length).fill(NaN);
    for (let i = kPeriod - 1; i < close.length; i++) {
      let highest = -Infinity;
      let lowest = Infinity;
      for (let j = 0; j < kPeriod; j++) {
        if (high[i - j] > highest) highest = high[i - j];
        if (low[i - j] < lowest) lowest = low[i - j];
      }
      kRaw[i] = ((close[i] - lowest) / (highest - lowest)) * 100;
    }
    
    // Pine Script stoch: k = sma(kRaw, smooth), d = sma(k, dPeriod)
    const kLine = sma(kRaw, smooth);
    const dLine = sma(kLine, dPeriod);
    
    return { k: kLine, d: dLine };
  }

  function bb(data, period, mult) {
    const basis = sma(data, period);
    const upper = new Array(data.length).fill(NaN);
    const lower = new Array(data.length).fill(NaN);
    
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      const mean = basis[i];
      for (let j = 0; j < period; j++) {
        sum += Math.pow(data[i - j] - mean, 2);
      }
      const stdev = Math.sqrt(sum / period);
      upper[i] = mean + (mult * stdev);
      lower[i] = mean - (mult * stdev);
    }
    return { mid: basis, upper, lower };
  }

  function supertrend(high, low, close, factor, period) {
    const atrVal = atr(high, low, close, period);
    const result = new Array(close.length).fill({ line: NaN, dir: 1 });
    
    // PineScript SuperTrend translation
    const hl2 = new Array(close.length).fill(NaN);
    for(let i=0; i<close.length; i++) hl2[i] = (high[i] + low[i]) / 2;

    const lowerBand = new Array(close.length).fill(NaN);
    const upperBand = new Array(close.length).fill(NaN);
    let trend = new Array(close.length).fill(1);
    let supertrendArr = new Array(close.length).fill(NaN);

    for (let i = period; i < close.length; i++) {
      const basicUpper = hl2[i] + factor * atrVal[i];
      const basicLower = hl2[i] - factor * atrVal[i];

      upperBand[i] = (basicUpper < upperBand[i-1] || close[i-1] > upperBand[i-1]) ? basicUpper : upperBand[i-1];
      lowerBand[i] = (basicLower > lowerBand[i-1] || close[i-1] < lowerBand[i-1]) ? basicLower : lowerBand[i-1];

      if (isNaN(upperBand[i-1])) upperBand[i] = basicUpper;
      if (isNaN(lowerBand[i-1])) lowerBand[i] = basicLower;

      if (close[i] <= upperBand[i-1] && close[i-1] > upperBand[i-1]) trend[i] = -1; // Bearish
      else if (close[i] >= lowerBand[i-1] && close[i-1] < lowerBand[i-1]) trend[i] = 1; // Bullish
      else trend[i] = trend[i-1] || 1;

      supertrendArr[i] = trend[i] === 1 ? lowerBand[i] : upperBand[i];
      result[i] = { line: supertrendArr[i], dir: trend[i] === 1 ? 1 : -1 }; // TV uses -1 for down
    }
    return result;
  }

  function linreg(data, period) {
    const result = new Array(data.length).fill(NaN);
    const slopes = new Array(data.length).fill(0);
    
    for (let i = period - 1; i < data.length; i++) {
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let j = 0; j < period; j++) {
        const x = j; // 0 to period-1
        const y = data[i - period + 1 + j];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      }
      const slope = (period * sumXY - sumX * sumY) / (period * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / period;
      result[i] = intercept + slope * (period - 1); // latest value on the line
      slopes[i] = slope;
    }
    return { line: result, slope: slopes };
  }

  // Pivot High/Low helper function
  function pivothigh(data, leftLen, rightLen) {
    const result = new Array(data.length).fill(NaN);
    for (let i = leftLen + rightLen; i < data.length; i++) {
      const centerIdx = i - rightLen;
      const centerVal = data[centerIdx];
      let isPivot = true;
      for (let j = 1; j <= leftLen; j++) {
        if (data[centerIdx - j] > centerVal) { isPivot = false; break; }
      }
      if (isPivot) {
        for (let j = 1; j <= rightLen; j++) {
          if (data[centerIdx + j] > centerVal) { isPivot = false; break; }
        }
      }
      if (isPivot) {
        result[i] = centerVal; // Detected at index i, conceptually occurred at centerIdx
      }
    }
    return result;
  }

  function pivotlow(data, leftLen, rightLen) {
    const result = new Array(data.length).fill(NaN);
    for (let i = leftLen + rightLen; i < data.length; i++) {
      const centerIdx = i - rightLen;
      const centerVal = data[centerIdx];
      let isPivot = true;
      for (let j = 1; j <= leftLen; j++) {
        if (data[centerIdx - j] < centerVal) { isPivot = false; break; }
      }
      if (isPivot) {
        for (let j = 1; j <= rightLen; j++) {
          if (data[centerIdx + j] < centerVal) { isPivot = false; break; }
        }
      }
      if (isPivot) {
        result[i] = centerVal;
      }
    }
    return result;
  }

  function vwap(high, low, close, volume) {
    const result = new Array(close.length).fill(NaN);
    let sumPV = 0;
    let sumV = 0;
    for (let i = 0; i < close.length; i++) {
      const hlc3 = (high[i] + low[i] + close[i]) / 3;
      sumPV += hlc3 * volume[i];
      sumV += volume[i];
      result[i] = sumPV / sumV;
    }
    // VWAP resets typically per day/session, 
    // but in Daily timeframe (like we are using), cumulative VWAP is a bit weird.
    // For simplicity, we just use a moving SMA of VWAP-like concept or full historical VWAP.
    return result;
  }

  // Cross helpers
  function crossunder(arr1, arr2) {
    const res = new Array(arr1.length).fill(false);
    for(let i=1; i<arr1.length; i++) {
      res[i] = (arr1[i] < arr2[i] && arr1[i-1] >= arr2[i-1]);
    }
    return res;
  }
  function crossover(arr1, arr2) {
    const res = new Array(arr1.length).fill(false);
    for(let i=1; i<arr1.length; i++) {
      res[i] = (arr1[i] > arr2[i] && arr1[i-1] <= arr2[i-1]);
    }
    return res;
  }

  // DEMA Math
  function dema(data, period) {
    const e1 = ema(data, period);
    const e2 = ema(e1, period);
    const result = new Array(data.length).fill(NaN);
    for(let i=0; i<data.length; i++) {
      result[i] = 2 * e1[i] - e2[i];
    }
    return result;
  }

  // ==========================================
  // STRATEGY CALCULATIONS
  // ==========================================

  // Calculate MC Predict Score
  function calculateMCPredict(ohlcv) {
    const c = ohlcv.map(d => d.close);
    const h = ohlcv.map(d => d.high);
    const l = ohlcv.map(d => d.low);
    const v = ohlcv.map(d => d.volume);

    // 1. TREND
    const ema9 = ema(c, 9);
    const ema21 = ema(c, 21);
    const ema50 = ema(c, 50);
    const ema200 = ema(c, 200);
    const st = supertrend(h, l, c, 3.0, 10);
    
    // 2. MOMENTUM
    const rsiVal = rsi(c, 14);
    const macdRes = macd(c, 12, 26, 9);
    const stochRes = stoch(c, h, l, 14, 3, 3); // K=14, D=3, smooth=3

    // 3. VOLATILITY
    const bbRes = bb(c, 20, 2.0);
    const atrVal = atr(h, l, c, 14);

    // 4. VOLUME
    const volMa = sma(v, 20);
    const obv = new Array(c.length).fill(0);
    for(let i=1; i<c.length; i++) {
      if(c[i] > c[i-1]) obv[i] = obv[i-1] + v[i];
      else if(c[i] < c[i-1]) obv[i] = obv[i-1] - v[i];
      else obv[i] = obv[i-1];
    }
    const obvMa = sma(obv, 20);
    const vwapVal = vwap(h, l, c, v);

    // 5. ML (ENSEMBLE RANDOM FOREST SIMULATION)
    const mlScore = new Array(c.length).fill(0);
    const rfLookback = 120;

    for(let i = rfLookback; i < c.length; i++) {
      // Tree 1: Momentum (RSI + MACD)
      let tree1 = 0;
      if (rsiVal[i] < 40 && macdRes.histogram[i] > macdRes.histogram[i-1]) tree1 = 1;
      else if (rsiVal[i] > 70 && macdRes.histogram[i] < macdRes.histogram[i-1]) tree1 = -1;

      // Tree 2: Volatility Breakout (Bollinger + ATR)
      let tree2 = 0;
      const bbWidth = (bbRes.upper[i] - bbRes.lower[i]) / c[i];
      if (c[i] > bbRes.upper[i-1] && bbWidth > 0.05) tree2 = 1; // Upward breakout
      else if (c[i] < bbRes.lower[i-1] && bbWidth > 0.05) tree2 = -1; // Downward breakout

      // Tree 3: Volume Trend (OBV Divergence)
      let tree3 = 0;
      if (c[i] < c[i-5] && obv[i] > obv[i-5]) tree3 = 1; // Bullish divergence
      else if (c[i] > c[i-5] && obv[i] < obv[i-5]) tree3 = -1; // Bearish divergence

      // Ensemble Weights
      const confidence = (tree1 * 0.4) + (tree2 * 0.35) + (tree3 * 0.25);
      mlScore[i] = confidence * 100; // -100 to +100
    }

    // Hull MA
    // n2ma = 2 * wma(close, period/2); nma = wma(close, period); diff = n2ma - nma; Hull = wma(diff, sqrt(period))
    const hullPeriod = 16;
    const n2ma = wma(c, Math.round(hullPeriod/2)).map(v => v * 2);
    const nma = wma(c, hullPeriod);
    const diff = n2ma.map((v, i) => v - nma[i]);
    const hullVal = wma(diff, Math.round(Math.sqrt(hullPeriod)));

    // Hull signal lines
    const hullLong = new Array(c.length).fill(false);
    const hullShort = new Array(c.length).fill(false);

    // Calculate daily scores
    const finalScore = new Array(c.length).fill(NaN);
    const scores = []; // array of detailed scores

    let lastRes = NaN, lastSup = NaN;
    const ph = pivothigh(h, 10, 10);
    const pl = pivotlow(l, 10, 10);

    for (let i = 1; i < c.length; i++) {
       const isVal = c[i];
       
       // Trend Score
       let tScore = 0;
       const emaBull = (ema9[i] > ema21[i] && ema21[i] > ema50[i] && ema50[i] > ema200[i]) ? 1 : 0;
       const emaBear = (ema9[i] < ema21[i] && ema21[i] < ema50[i] && ema50[i] < ema200[i]) ? -1 : 0;
       tScore += (emaBull + emaBear) * 30;
       tScore += (c[i] > ema200[i] ? 1 : -1) * 20;
       tScore += (c[i] > ema50[i] ? 1 : -1) * 15;
       tScore += (ema50[i] > ema200[i] && ema50[i-1] <= ema200[i-1] ? 1 : ema50[i] < ema200[i] && ema50[i-1] >= ema200[i-1] ? -1 : 0) * 15;
       tScore += (st[i].dir === -1 ? 1 : -1) * 20;

       // Momentum Score
       let rScore = 0;
       if (isNaN(rsiVal[i])) rScore = 0;
       else if(rsiVal[i] > 70) rScore = -((rsiVal[i] - 70) / 30) * 100;
       else if(rsiVal[i] < 30) rScore = ((30 - rsiVal[i]) / 30) * 100;
       else rScore = ((rsiVal[i] - 50) / 50) * 50;

       let mScore = macdRes.macdLine[i] > macdRes.signalLine[i] ? 50 : -50;
       mScore += macdRes.histogram[i] > macdRes.histogram[i-1] ? 25 : -25;
       
       let stScore = 0;
       if (isNaN(stochRes.k[i])) stScore = 0;
       else if(stochRes.k[i] > 80) stScore = -(stochRes.k[i] - 80) / 20 * 100;
       else if(stochRes.k[i] < 20) stScore = (20 - stochRes.k[i]) / 20 * 100;
       else stScore = (stochRes.k[i] - 50) / 50 * 60;

       const momScore = (rScore * 0.35) + (mScore * 0.4) + (stScore * 0.25);

       // Volatility
       const bbRange = (bbRes.upper[i] - bbRes.lower[i]);
       const bbpct = (bbRange === 0 || isNaN(bbRange)) ? 0.5 : (c[i] - bbRes.lower[i]) / bbRange;
       const volScore = isNaN(bbpct) ? 0 : bbpct > 1 ? -80 : bbpct < 0 ? 80 : (bbpct - 0.5) * 160;

       // Volume
       let vScore = 0;
       vScore += (c[i] > c[i-1] && (v[i]/volMa[i]) > 1.2) ? 40 : (c[i] < c[i-1] && (v[i]/volMa[i]) > 1.2) ? -40 : 0;
       vScore += (obv[i] > obvMa[i]) ? 30 : -30;
       vScore += (c[i] > vwapVal[i]) ? 30 : -30;

       // SR
       if(!isNaN(ph[i])) lastRes = ph[i];
       if(!isNaN(pl[i])) lastSup = pl[i];

       const distR = isNaN(lastRes) ? 0 : (lastRes - c[i]) / c[i] * 100;
       const distS = isNaN(lastSup) ? 0 : (c[i] - lastSup) / c[i] * 100;
       let srScore = 0;
       if(distR < 1.0 && !isNaN(lastRes)) srScore = -60;
       else if(distS < 1.0 && !isNaN(lastSup)) srScore = 60;
       else if(!isNaN(lastRes) && !isNaN(lastSup)) srScore = (distR - distS) / (distR + distS + 0.001) * 100;

       // Formula combining
       const rawVal = (tScore*25 + momScore*20 + volScore*15 + vScore*15 + srScore*10 + mlScore[i]*10) / 85; 
       const mcRaw = isNaN(rawVal) ? 0 : rawVal;
       
       // MACD DEMA
       const demaSlow = dema(c, 26);
       const demaFast = dema(c, 12);
       const demaMacd = demaFast[i] - demaSlow[i];
       // To do proper signal, would need array, approximating current val
       // but here we just pass the raw mcRaw forward to smooth it
       finalScore[i] = mcRaw;
       
       scores.push({
         time: ohlcv[i].time,
         hullVal: hullVal[i],
         hullColor: hullVal[i] > hullVal[i-1] ? 'green' : 'red',
         n1_greater: hullVal[i] > hullVal[i-1],
         trendScore: tScore,
         momentumScore: momScore,
         volScore: volScore,
         vScore: vScore,
         srScore: srScore,
         mlScore: mlScore[i],
         finalPrediction: mcRaw,
         rsi: rsiVal[i],
         atr: atrVal[i],
         macdLine: macdRes.macdLine[i],
         signalLine: macdRes.signalLine[i]
       });

       // Signals
       hullLong[i] = hullVal[i] > hullVal[i-1] && hullVal[i-1] <= hullVal[i-2];
       hullShort[i] = hullVal[i] < hullVal[i-1] && hullVal[i-1] >= hullVal[i-2];
    }
    
    // Smooth score
    const smoothScore = ema(finalScore, 3);
    for(let i=0; i<smoothScore.length; i++) {
        if(scores[i-1]) scores[i-1].finalPrediction = smoothScore[i];
    }

    return { hullVal, hullLong, hullShort, scores };
  }

  // Calculate MACD DEMA Pro
  function calculateMacdDemaPro(ohlcv) {
    const c = ohlcv.map(d => d.close);
    const dSlow = dema(c, 26);
    const dFast = dema(c, 12);
    
    const macdLine = new Array(c.length).fill(NaN);
    for(let i=0; i<c.length; i++) macdLine[i] = dFast[i] - dSlow[i];

    const e1Sign = ema(macdLine, 9);
    const e2Sign = ema(e1Sign, 9);
    const signalLine = new Array(c.length).fill(NaN);
    const histogram = new Array(c.length).fill(NaN);

    for(let i=0; i<c.length; i++) {
      signalLine[i] = 2 * e1Sign[i] - e2Sign[i];
      histogram[i] = macdLine[i] - signalLine[i];
    }

    // Divergence logic
    const lookback = 14;
    const pricePh = pivothigh(c, lookback, lookback);
    const pricePl = pivotlow(c, lookback, lookback);
    const macdPh = pivothigh(macdLine, lookback, lookback);
    const macdPl = pivotlow(macdLine, lookback, lookback);

    const bullDiv = new Array(c.length).fill(false);
    const bearDiv = new Array(c.length).fill(false);
    
    let prevPriceLo = NaN, prevMacdLo = NaN;
    let prevPriceHi = NaN, prevMacdHi = NaN;

    for(let i = 0; i < c.length; i++) {
      if(!isNaN(pricePl[i]) && !isNaN(macdPl[i])) {
        if(!isNaN(prevPriceLo) && !isNaN(prevMacdLo)) {
          if(pricePl[i] < prevPriceLo && macdPl[i] > prevMacdLo) {
            bullDiv[i] = true;
          }
        }
        prevPriceLo = pricePl[i];
        prevMacdLo = macdPl[i];
      }

      if(!isNaN(pricePh[i]) && !isNaN(macdPh[i])) {
        if(!isNaN(prevPriceHi) && !isNaN(prevMacdHi)) {
          if(pricePh[i] > prevPriceHi && macdPh[i] < prevMacdHi) {
            bearDiv[i] = true;
          }
        }
        prevPriceHi = pricePh[i];
        prevMacdHi = macdPh[i];
      }
    }

    // Entry Score & Expensive Score
    const rsiVal = rsi(c, 14);
    const ema200 = ema(c, 200);
    const bbRes = bb(c, 20, 2.0);
    const stats = [];

    for (let i=0; i<c.length; i++) {
        // High 52w (roughly 252 trading days)
        let max52 = -Infinity, min52 = Infinity;
        for(let j=Math.max(0, i-252); j<=i; j++) {
            if(ohlcv[j].high > max52) max52 = ohlcv[j].high;
            if(ohlcv[j].low < min52) min52 = ohlcv[j].low;
        }
        const pos52 = (c[i] - min52) / (max52 - min52 + 0.0001);
        
        let entryScore = 0;
        if(macdLine[i] > signalLine[i]) entryScore++;
        if(rsiVal[i] < 45) entryScore++;
        if(((c[i] - ema200[i]) / ema200[i]) < 0.03) entryScore++;
        if(histogram[i] > histogram[i-1]) entryScore++;
        if(pos52 < 0.5) entryScore++;

        const distEma = (c[i] - ema200[i]) / ema200[i] * 100;
        const bbpct = Math.min(Math.max((c[i] - bbRes.lower[i]) / (bbRes.upper[i] - bbRes.lower[i]), 0), 1.0);
        let expScore = (pos52 * 2.0) + (rsiVal[i]/100) + (distEma > 0 ? Math.min(distEma/20, 1.0) : 0) + bbpct;
        expScore = Math.round(Math.max(1, Math.min(5, expScore)));

        stats.push({
            entryScore,
            expScore,
            bullDiv: bullDiv[i],
            bearDiv: bearDiv[i],
            macdLine: macdLine[i],
            signalLine: signalLine[i],
            histogram: histogram[i]
        });
    }

    return { macdLine, signalLine, histogram, bullDiv, bearDiv, stats };
  }

  // Linear Regression Prediction for UI
  function calculatePredictionLines(ohlcv) {
      const c = ohlcv.map(d => d.close);
      const lr2w = linreg(c, 50);
      const lr6m = linreg(c, 200);

      // Latest slopes
      const slope2w = lr2w.slope[c.length-1];
      const slope6m = lr6m.slope[c.length-1];
      const currentPrice = c[c.length-1];

      return {
          pred2w: currentPrice + slope2w * 10,
          pred6m: currentPrice + slope6m * 126
      };
  }

  return { calculateMCPredict, calculateMacdDemaPro, calculatePredictionLines };

})();

window.Indicators = Indicators;
