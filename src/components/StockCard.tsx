'use client';

import { useState } from 'react';
import Link from 'next/link';

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

  const isUp = quote && quote.changePercent > 0;
  const isDown = quote && quote.changePercent < 0;

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{stock.name}</h3>
          <p className="text-sm text-gray-400">{stock.code} · {stock.market}</p>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-400 transition-colors"
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
              <p className="text-gray-300">{(quote.volume / 10000).toFixed(0)}万</p>
            </div>
          </div>

          <button
            onClick={() => setShowKline(!showKline)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            {showKline ? '隐藏K线' : '查看K线'}
          </button>

          {showKline && (
            <KlineChart code={stock.code} market={stock.market} />
          )}
        </>
      ) : (
        <div className="text-gray-500 text-center py-4">加载中...</div>
      )}
    </div>
  );
}

// K线图组件
function KlineChart({ code, market }: { code: string; market: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch(`/api/quote?code=${code}&market=${market}&days=30`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data || []);
        }
        setLoading(false);
      });
  });

  if (loading) {
    return <div className="text-gray-500 text-center py-2">K线加载中...</div>;
  }

  return (
    <div className="mt-3 p-2 bg-gray-900 rounded-lg">
      <p className="text-xs text-gray-500 mb-2">{code} 近30日行情</p>
      <div className="overflow-x-auto">
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
            {data.slice(-5).reverse().map((item: any, i: number) => (
              <tr key={i} className="text-gray-300">
                <td className="py-1">{item.date}</td>
                <td className="text-right">{item.open?.toFixed(2)}</td>
                <td className="text-right">{item.close?.toFixed(2)}</td>
                <td className={`text-right ${item.close >= item.open ? 'text-green-400' : 'text-red-400'}`}>
                  {((item.close - item.open) / item.open * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
