// 股票数据源工具

// 新浪财经 API（A股）
export async function fetchAStock(code: string) {
  const sinaCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
  const url = `https://hq.sinajs.cn/list=${sinaCode}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
      }
    });
    const text = await response.text();
    
    if (!text || text.includes('null') || text.length < 10) {
      throw new Error('No data');
    }
    
    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) {
      throw new Error('Parse error');
    }
    
    const data = match[1].split(',');
    
    if (!data[0]) {
      throw new Error('Empty data');
    }
    
    return {
      code: code,
      name: data[0],
      open: parseFloat(data[1]) || 0,
      high: parseFloat(data[2]) || 0,
      low: parseFloat(data[3]) || 0,
      close: parseFloat(data[4]) || 0,
      volume: parseInt(data[5]) || 0,
      amount: parseFloat(data[6]) || 0,
      change: parseFloat(data[7]) || 0,
      changePercent: parseFloat(data[8]) || 0,
      market: 'A股',
      exchange: code.startsWith('6') ? 'SSE' : 'SZSE',
    };
  } catch (error) {
    console.error(`Failed to fetch A stock ${code}:`, error);
    return null;
  }
}

// 港股数据源
export async function fetchHKStock(code: string) {
  const hkCode = code.startsWith('0') ? code : `0${code}`;
  const url = `https://hq.sinajs.cn/list=hk${hkCode}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://',
      }
   finance.sina.com.cn });
    const text = await response.text();
    
    if (!text || text.includes('null') || text.length < 10) {
      throw new Error('No data');
    }
    
    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) {
      throw new Error('Parse error');
    }
    
    const data = match[1].split(',');
    
    return {
      code: code,
      name: data[1] || '',
      open: parseFloat(data[2]) || 0,
      high: parseFloat(data[3]) || 0,
      low: parseFloat(data[4]) || 0,
      close: parseFloat(data[5]) || 0,
      volume: parseInt(data[6]) || 0,
      amount: parseFloat(data[7]) || 0,
      change: parseFloat(data[8]) || 0,
      changePercent: parseFloat(data[9]) || 0,
      market: '港股',
      exchange: 'HKEX',
    };
  } catch (error) {
    console.error(`Failed to fetch HK stock ${code}:`, error);
    return null;
  }
}

// Yahoo Finance（美股）
export async function fetchUSStock(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  
  try {
    const response = await fetch(url);
    const json = await response.json();
    
    const result = json?.chart?.result?.[0];
    if (!result) {
      throw new Error('No data');
    }
    
    const meta = result.meta;
    
    return {
      code: symbol,
      name: meta.shortName || meta.symbol || symbol,
      open: meta.previousClose || meta.chartPreviousClose || 0,
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
      close: meta.regularMarketPrice || meta.previousClose || 0,
      volume: meta.regularMarketVolume || 0,
      amount: 0,
      change: meta.regularMarketPrice - meta.previousClose || 0,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
      market: '美股',
      exchange: meta.exchange || 'NASDAQ',
    };
  } catch (error) {
    console.error(`Failed to fetch US stock ${symbol}:`, error);
    return null;
  }
}

// 获取美股历史数据
export async function fetchUSStockHistory(symbol: string, days: number = 30) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${days}d`;
  
  try {
    const response = await fetch(url);
    const json = await response.json();
    
    const result = json?.chart?.result?.[0];
    if (!result) return [];
    
    const timestamps = result.timestamp;
    const quote = result.indicators?.quote?.[0];
    
    if (!timestamps || !quote) return [];
    
    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: quote.open?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      close: quote.close?.[i] || 0,
      volume: quote.volume?.[i] || 0,
    }));
  } catch (error) {
    console.error(`Failed to fetch US stock history ${symbol}:`, error);
    return [];
  }
}

// 统一接口
export async function fetchStock(code: string, market: string) {
  if (market === 'A股') {
    return fetchAStock(code);
  } else if (market === '港股') {
    return fetchHKStock(code);
  } else {
    return fetchUSStock(code);
  }
}

export async function fetchStockHistory(code: string, market: string, days: number = 30) {
  if (market === 'A股' || market === '港股') {
    // 暂时返回空数组，历史数据需要另外处理
    return [];
  } else {
    return fetchUSStockHistory(code, days);
  }
}
