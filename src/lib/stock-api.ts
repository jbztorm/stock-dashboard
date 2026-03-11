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
    
    // 解析 v天一交所返回的数据
    const match = text.match(/="([^"])"/);
    if (!match) {
      throw new Error('Parse error');
    }
    
    const data = match[1].split('~');
    return {
      code,
      name: data[1],
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

// 获取A股历史数据（简化的 K 线数据）
export async function fetchAStockHistory(code: string, days: number = 30) {
  // 腾讯财经历史数据接口
  const tsCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
  const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${tsCode},day,,${days},qfq`;
  
  try {
    const response = await fetch(url);
    const json = await response.json();
    
    const data = json?.data?.[tsCode]?.data?.qfq;
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
  const YahooFinance = require('yahoo-finance2').default;
  
  try {
    const quote = await YahooFinance.quote(symbol);
    const result = {
      code: symbol,
      name: quote.shortName || quote.longName || symbol,
      open: quote.regularMarketOpen || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      close: quote.regularMarketPreviousClose || 0,
      volume: quote.regularMarketVolume || 0,
      amount: 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      market: '美股',
      exchange: quote.exchange || 'NASDAQ',
    };
    
    // 计算实时价格变化
    if (quote.regularMarketPrice && quote.regularMarketPreviousClose) {
      result.close = quote.regularMarketPrice;
      result.change = quote.regularMarketPrice - quote.regularMarketPreviousClose;
      result.changePercent = (result.change / quote.regularMarketPreviousClose) * 100;
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to fetch US stock ${symbol}:`, error);
    return null;
  }
}

// 获取美股历史数据
export async function fetchUSStockHistory(symbol: string, days: number = 30) {
  const YahooFinance = require('yahoo-finance2').default;
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const history = await YahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });
    
    return history.map((item: any) => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
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
