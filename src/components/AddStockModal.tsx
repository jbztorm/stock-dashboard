'use client';

import { useState } from 'react';

interface Stock {
  code: string;
  name: string;
  market: string;
  exchange?: string;
}

interface AddStockModalProps {
  onClose: () => void;
  onAdd: (stock: Stock) => void;
}

// 常用股票代码
const PRESET_STOCKS = [
  { code: '600519', name: '贵州茅台', market: 'A股' },
  { code: '000858', name: '五粮液', market: 'A股' },
  { code: '601318', name: '中国平安', market: 'A股' },
  { code: '000333', name: '美的集团', market: 'A股' },
  { code: 'AAPL', name: 'Apple Inc.', market: '美股' },
  { code: 'MSFT', name: 'Microsoft', market: '美股' },
  { code: 'GOOGL', name: 'Alphabet', market: '美股' },
  { code: 'NVDA', name: 'NVIDIA', market: '美股' },
  { code: 'TSLA', name: 'Tesla', market: '美股' },
];

export default function AddStockModal({ onClose, onAdd }: AddStockModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [market, setMarket] = useState('美股');

  const handlePresetClick = (stock: typeof PRESET_STOCKS[0]) => {
    setCode(stock.code);
    setName(stock.name);
    setMarket(stock.market);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert('请填写股票代码和名称');
      return;
    }
    onAdd({ code, name, market });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">添加自选股</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* 快速选择 */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">快速选择:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_STOCKS.map((stock) => (
              <button
                key={stock.code}
                onClick={() => handlePresetClick(stock)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
              >
                {stock.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">市场</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="美股">美股</option>
              <option value="A股">A股</option>
              <option value="港股">港股</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">股票代码</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={market === '美股' ? '如 AAPL' : '如 600519'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 placeholder-gray-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">股票名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如 Apple Inc."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            添加
          </button>
        </form>
      </div>
    </div>
  );
}
