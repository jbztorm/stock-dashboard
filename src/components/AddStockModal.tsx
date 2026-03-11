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

// 常用股票代码（快速选择）
const PRESET_STOCKS = {
  '美股': [
    { code: 'AAPL', name: 'Apple Inc.' },
    { code: 'MSFT', name: 'Microsoft' },
    { code: 'GOOGL', name: 'Alphabet' },
    { code: 'NVDA', name: 'NVIDIA' },
    { code: 'TSLA', name: 'Tesla' },
    { code: 'META', name: 'Meta' },
    { code: 'AMZN', name: 'Amazon' },
  ],
  'A股': [
    { code: '600519', name: '贵州茅台' },
    { code: '000858', name: '五粮液' },
    { code: '601318', name: '中国平安' },
    { code: '000333', name: '美的集团' },
    { code: '600036', name: '招商银行' },
  ],
  '港股': [
    { code: '00700', name: '腾讯控股' },
    { code: '09988', name: '阿里巴巴' },
    { code: '03690', name: '美团' },
    { code: '01810', name: '小米集团' },
  ],
};

export default function AddStockModal({ onClose, onAdd }: AddStockModalProps) {
  const [code, setCode] = useState('');
  const [market, setMarket] = useState('美股');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('请输入股票代码');
      return;
    }
    
    const stockCode = code.trim().toUpperCase();
    // 根据市场生成默认名称
    const defaultName = stockCode;
    onAdd({ code: stockCode, name: defaultName, market });
  };

  const handlePresetClick = (stock: { code: string; name: string }) => {
    onAdd({ code: stock.code, name: stock.name, market });
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
          
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">美股</p>
            <div className="flex flex-wrap gap-1">
              {PRESET_STOCKS['美股'].map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => handlePresetClick(stock)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                >
                  {stock.code}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">A股</p>
            <div className="flex flex-wrap gap-1">
              {PRESET_STOCKS['A股'].map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => handlePresetClick(stock)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                >
                  {stock.code}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">港股</p>
            <div className="flex flex-wrap gap-1">
              {PRESET_STOCKS['港股'].map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => handlePresetClick(stock)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                >
                  {stock.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 手动输入 */}
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

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">股票代码</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={market === '美股' ? '如 AAPL' : '如 600519'}
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
