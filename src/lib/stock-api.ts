// 股票数据源工具 - 使用多个数据源

// 尝试从腾讯财经获取A股数据（用于本地开发）
async function fetchAStockFromTencent(code: string) {
  const tsCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
  const url = `https://qt.gtimg.cn/q=${tsCode}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    if (!text || text === 'null' || text.includes('v_')) {
      return null;
    }
    
    const match = text.match(/="([^"]+)"/);
    if (!match) return null;
    
    const data = match[1].split('~');
    
    return {
      code: data[2] || code,
      name: decodeURIComponent(escape(data[1] || '')),
      open: parseFloat(data[5]) || 0,
      high: parseFloat(data[33]) || 0,
      low: parseFloat(data[34]) || 0,
      close: parseFloat(data[3]) || 0,
      volume: parseInt(data[4]) || 0,
      amount: parseFloat(data[37]) || 0,
      change: parseFloat(data[31]) || 0,
      changePercent: parseFloat(data[32]) || 0,
      market: 'A股',
      exchange: code.startsWith('6') ? 'SSE' : 'SZSE',
    };
  } catch (error) {
    return null;
  }
}

// 从新浪财经获取A股数据
async function fetchAStockFromSina(code: string) {
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
      return null;
    }
    
    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) return null;
    
    const data = match[1].split(',');
    if (!data[0]) return null;
    
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
    return null;
  }
}

// 港股数据源
async function fetchHKStock(code: string) {
  const hkCode = code.startsWith('0') ? code : `0${code}`;
  const url = `https://hq.sinajs.cn/list=hk${hkCode}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
      }
    });
    const text = await response.text();
    
    if (!text || text.includes('null') || text.length < 10) {
      return null;
    }
    
    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) return null;
    
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
    return null;
  }
}

// A股 - 尝试多个数据源
export async function fetchAStock(code: string) {
  // 先尝试腾讯
  let result = await fetchAStockFromTencent(code);
  if (result) return result;
  
  // 再试新浪
  result = await fetchAStockFromSina(code);
  if (result) return result;
  
  // 都失败返回null
  return null;
}

// Yahoo Finance（美股）
export async function fetchUSStock(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  
  try {
    const response = await fetch(url);
    const json = await response.json();
    
    const result = json?.chart?.result?.[0];
    if (!result) {
      return null;
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
    return null;
  }
}

// 获取美股历史数据
export async function fetchUSStockHistory(symbol: string, days: number = 60) {
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
    return [];
  }
}

// 港股历史数据
async function fetchHKStockHistory(code: string, days: number = 60) {
  // 港股暂不支持历史数据
  return [];
}

// A股历史数据
async function fetchAStockHistory(code: string, days: number = 60) {
  // A股暂不支持历史数据（Vercel无法访问国内API）
  return [];
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

export async function fetchStockHistory(code: string, market: string, days: number = 60) {
  if (market === 'A股') {
    return fetchAStockHistory(code, days);
  } else if (market === '港股') {
    return fetchHKStockHistory(code, days);
  } else {
    return fetchUSStockHistory(code, days);
  }
}
