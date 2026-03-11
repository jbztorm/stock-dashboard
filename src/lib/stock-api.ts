// 股票数据源工具 - 仅支持美股

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
    console.error(`Failed to fetch US stock ${symbol}:`, error);
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
    console.error(`Failed to fetch US stock history ${symbol}:`, error);
    return [];
  }
}

// 统一接口
export async function fetchStock(code: string, market: string) {
  return fetchUSStock(code);
}

export async function fetchStockHistory(code: string, market: string, days: number = 60) {
  return fetchUSStockHistory(code, days);
}
