import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchStock, fetchStockHistory } from '@/lib/stock-api';

// 获取实时行情
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codes, markets } = body;

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing stock codes' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      codes.map(async (code: string, index: number) => {
        const stockMarket = markets?.[index] || '美股';
        const quote = await fetchStock(code, stockMarket);
        return { code, market: stockMarket, quote };
      })
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 获取 K 线数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const market = searchParams.get('market') || '美股';
    const days = parseInt(searchParams.get('days') || '30');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Missing stock code' },
        { status: 400 }
      );
    }

    const history = await fetchStockHistory(code, market, days);

    // 计算均线
    const prices = history.map((h: any) => h.close);
    const ma5 = calculateMA(prices, 5);
    const ma10 = calculateMA(prices, 10);
    const ma20 = calculateMA(prices, 20);

    const klineData = history.map((item: any, index: number) => ({
      ...item,
      ma5: ma5[index] || null,
      ma10: ma10[index] || null,
      ma20: ma20[index] || null,
    }));

    return NextResponse.json({ success: true, data: klineData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function calculateMA(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(parseFloat((sum / period).toFixed(2)));
    }
  }
  
  return result;
}
