'use client';

import { useState } from 'react';

interface Stock {
  code: string;
  name: string;
  market: string;
}

interface AddStockModalProps {
  onClose: () => void;
  onAdd: (stock: Stock) => void;
}

// 美股常用股票
const PRESET_STOCKS = [
  { code: 'AAPL', name: 'Apple Inc.' },
  { code: 'MSFT', name: 'Microsoft' },
  { code: 'GOOGL', name: 'Alphabet' },
  { code: 'NVDA', name: 'NVIDIA' },
  { code: 'TSLA', name: 'Tesla' },
  { code: 'META', name: 'Meta' },
  { code: 'AMZN', name: 'Amazon' },
  { code: 'AMD', name: 'AMD' },
  { code: 'NFLX', name: 'Netflix' },
  { code: 'DIS', name: 'Disney' },
  { code: 'JPM', name: 'JPMorgan' },
  { code: 'V', name: 'Visa' },
];

export default function AddStockModal({ onClose, onAdd }: AddStockModalProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('请输入股票代码');
      return;
    }
    
    const stockCode = code.trim().toUpperCase();
    onAdd({ code: stockCode, name: stockCode, market: '美股' });
  };

  const handlePresetClick = (stock: { code: string; name: string }) => {
    onAdd({ code: stock.code, name: stock.name, market: '美股' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">添加股票</h2>
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
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-lg"
              >
                {stock.code}
              </button>
            ))}
          </div>
        </div>

        {/* 手动输入 */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">股票代码</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="如 AAPL, MSFT, NVDA"
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
