import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchStock } from '@/lib/stock-api';
import { sendStockAlert } from '@/lib/feishu';

// 定时更新数据
export async function POST(request: Request) {
  try {
    // 获取所有自选股
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('*');

    if (stocksError) throw stocksError;

    const today = new Date().toISOString().split('T')[0];
    const results = [];

    // 获取每只股票的实时数据
    for (const stock of stocks || []) {
      try {
        const quote = await fetchStock(stock.code, stock.market);
        
        if (quote) {
          // 存储日线数据
          const { error: dataError } = await supabase
            .from('daily_data')
            .upsert({
              stock_id: stock.id,
              date: today,
              open: quote.open,
              high: quote.high,
              low: quote.low,
              close: quote.close,
              volume: quote.volume,
              amount: quote.amount,
              change_percent: quote.changePercent,
            }, {
              onConflict: 'stock_id,date',
            });

          if (dataError) {
            console.error(`Failed to save data for ${stock.code}:`, dataError);
          }

          // 检查预警
          const { data: alerts } = await supabase
            .from('alerts')
            .select('*')
            .eq('stock_id', stock.id)
            .eq('enabled', true);

          for (const alert of alerts || []) {
            const triggered = 
              (alert.alert_type === '涨幅' && quote.changePercent >= alert.threshold) ||
              (alert.alert_type === '跌幅' && quote.changePercent <= -alert.threshold);

            if (triggered) {
              // 发送飞书通知
              await sendStockAlert(
                stock.name,
                stock.code,
                quote.close,
                quote.changePercent,
                alert.alert_type as '涨幅' | '跌幅'
              );

              // 记录触发日志
              await supabase
                .from('alert_logs')
                .insert([{
                  alert_id: alert.id,
                  stock_id: stock.id,
                  triggered_price: quote.close,
                  change_percent: quote.changePercent,
                  notified: true,
                  notified_at: new Date().toISOString(),
                }]);

              // 更新最后触发时间
              await supabase
                .from('alerts')
                .update({ last_triggered_at: new Date().toISOString() })
                .eq('id', alert.id);
            }
          }

          results.push({ code: stock.code, success: true, quote });
        }
      } catch (err) {
        console.error(`Failed to fetch ${stock.code}:`, err);
        results.push({ code: stock.code, success: false });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${results.filter((r: any) => r.success).length} stocks`,
      results 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
