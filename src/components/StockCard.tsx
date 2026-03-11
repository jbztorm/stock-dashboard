'use client';

import { useState, useEffect } from 'react';

interface Stock {
  id: string;
  code: string;
  name: string;
  market: string;
}

interface Quote {
  code: string;
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

interface StockCardProps {
  stock: Stock;
  quote?: Quote;
  onDelete: () => void;
}

export default function StockCard({ stock, quote, onDelete }: StockCardProps) {
  const [showKline, setShowKline] = useState(false);
  const [klineData, setKlineData] = useState<any[]>([]);
  const [klineLoading, setKlineLoading] = useState(false);

  const isUp = quote && quote.changePercent > 0;
  const isDown = quote && quote.changePercent < 0;

  // 加载K线数据
  useEffect(() => {
    if (showKline && klineData.length === 0) {
      setKlineLoading(true);
      fetch(`/api/quote?code=${stock.code}&market=${stock.market}&days=60`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setKlineData(json.data || []);
          }
          setKlineLoading(false);
        })
        .catch(() => setKlineLoading(false));
    }
  }, [showKline, stock.code, stock.market]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{stock.name}</h3>
          <p className="text-sm text-gray-400">{stock.code} · {stock.market}</p>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-500 hover:text-red-400 transition-colors"
          title="删除"
        >
          ✕
        </button>
      </div>

      {quote ? (
        <>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-2xl font-bold text-white">
                {quote.close.toFixed(2)}
              </p>
            </div>
            <div className={`text-right ${isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-gray-400'}`}>
              <p className="font-medium">
                {isUp ? '↑' : isDown ? '↓' : ''}{quote.change.toFixed(2)}
              </p>
              <p className="text-sm">
                ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-3">
            <div>
              <p>开盘</p>
              <p className="text-gray-300">{quote.open.toFixed(2)}</p>
            </div>
            <div>
              <p>最高</p>
              <p className="text-gray-300">{quote.high.toFixed(2)}</p>
            </div>
            <div>
              <p>最低</p>
              <p className="text-gray-300">{quote.low.toFixed(2)}</p>
            </div>
            <div>
              <p>成交量</p>
              <p className="text-gray-300">{formatVolume(quote.volume)}</p>
            </div>
          </div>

          <button
            onClick={() => setShowKline(!showKline)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            {showKline ? '隐藏K线' : '查看K线'}
          </button>

          {showKline && (
            <KlineChart data={klineData} loading={klineLoading} />
          )}
        </>
      ) : (
        <div className="text-gray-500 text-center py-4">
          <p>加载中...</p>
          <p className="text-xs mt-1">{stock.market} 数据暂不可用</p>
        </div>
      )}
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 100000000) return (v / 100000000).toFixed(1) + '亿';
  if (v >= 10000) return (v / 10000).toFixed(0) + '万';
  return v.toString();
}

// K线图组件
function KlineChart({ data, loading }: { data: any[]; loading: boolean }) {
  if (loading) {
    return <div className="text-gray-500 text-center py-4">K线加载中...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="mt-3 p-3 bg-gray-900 rounded-lg">
        <p className="text-xs text-gray-500 text-center">暂无K线数据</p>
        <p className="text-xs text-gray-600 text-center mt-1">（A股/港股数据暂不可用）</p>
      </div>
    );
  }

  // 只显示最近60天数据
  const displayData = data.slice(-60);

  return (
    <div className="mt-3 p-3 bg-gray-900 rounded-lg overflow-x-auto">
      <p className="text-xs text-gray-500 mb-2">最近60个交易日</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left py-1">日期</th>
            <th className="text-right py-1">开盘</th>
            <th className="text-right py-1">收盘</th>
            <th className="text-right py-1">涨跌</th>
          </tr>
        </thead>
        <tbody>
          {displayData.reverse().map((item: any, i: number) => (
            <tr key={i} className="text-gray-300">
              <td className="py-1">{item.date}</td>
              <td className="text-right">{item.open?.toFixed(2)}</td>
              <td className="text-right">{item.close?.toFixed(2)}</td>
              <td className={`text-right ${item.close >= item.open ? 'text-green-400' : 'text-red-400'}`}>
                {item.open ? ((item.close - item.open) / item.open * 100).toFixed(2) : '0.00'}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
