// 股票数据源工具

// 腾讯财经 API（A股）
export async function fetchAStock(code: string) {
  const tsCode = code.startsWith('6') || code.startsWith('0') 
    ? (code.startsWith('6') ? `sh${code}` : `sz${code}`)
    : code;
  
  const url = `https://qt.gtimg.cn/q=${tsCode}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    if (!text || text === 'null') {
      throw new Error('No data');
    }
    
    // 解析格式: v_sh600519="1~贵州茅台~600519~1399.97~..."
    const match = text.match(/="([^"]+)"/);
    if (!match) {
      throw new Error('Parse error');
    }
    
    const data = match[1].split('~');
    
    // 腾讯财经数据字段索引
    // 0: 市场代号, 1: 名称, 2: 代码, 3: 当前价, 4: 涨跌, 5: 涨跌幅
    // ...更多字段
    
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
    console.error(`Failed to fetch A stock ${code}:`, error);
    return null;
  }
}

// 获取A股历史数据
export async function fetchAStockHistory(code: string, days: number = 30) {
  const tsCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
  const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${tsCode},day,,${days},qfq`;
  
  try {
    const response = await fetch(url);
    const json = await response.json();
    
    const stockData = json?.data?.[tsCode];
    if (!stockData) return [];
    
    const data = stockData?.data?.qfq || stockData?.data?.day;
    if (!data || !data.day) {
      return [];
    }
    
    return data.day.map((item: string[]) => ({
      date: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseInt(item[5]) || 0,
    }));
  } catch (error) {
    console.error(`Failed to fetch A stock history ${code}:`, error);
    return [];
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
    const quote = result.indicators?.quote?.[0];
    
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
  if (market === 'A股' || market === '港股') {
    return fetchAStock(code);
  } else {
    return fetchUSStock(code);
  }
}

export async function fetchStockHistory(code: string, market: string, days: number = 30) {
  if (market === 'A股' || market === '港股') {
    return fetchAStockHistory(code, days);
  } else {
    return fetchUSStockHistory(code, days);
  }
}
