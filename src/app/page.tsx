'use client';

import { useState, useEffect } from 'react';
import StockCard from '@/components/StockCard';
import AddStockModal from '@/components/AddStockModal';
import AlertsPanel from '@/components/AlertsPanel';

interface Stock {
  id: string;
  code: string;
  name: string;
  market: string;
  exchange?: string;
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

export default function Dashboard() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadStocks();
  }, []);

  // 定期刷新数据
  useEffect(() => {
    if (stocks.length > 0) {
      refreshQuotes();
      const interval = setInterval(refreshQuotes, 30000); // 每30秒刷新
      return () => clearInterval(interval);
    }
  }, [stocks]);

  const loadStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      const json = await res.json();
      if (json.success) {
        setStocks(json.data || []);
        if (json.data?.length > 0) {
          refreshQuotes(json.data);
        }
      }
    } catch (error) {
      console.error('Failed to load stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshQuotes = async (stockList?: Stock[]) => {
    const list = stockList || stocks;
    if (list.length === 0) return;

    try {
      const codes = list.map((s: Stock) => s.code);
      const markets = list.map((s: Stock) => s.market);
      
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes, markets }),
      });
      
      const json = await res.json();
      if (json.success) {
        const quoteMap: Record<string, Quote> = {};
        json.data?.forEach((item: any) => {
          if (item.quote) {
            quoteMap[item.code] = item.quote;
          }
        });
        setQuotes(quoteMap);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to refresh quotes:', error);
    }
  };

  const handleAddStock = async (stock: Omit<Stock, 'id'>) => {
    try {
      const res = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock),
      });
      
      const json = await res.json();
      if (json.success) {
        loadStocks();
        setShowAddModal(false);
      } else {
        alert(json.error || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      const res = await fetch(`/api/stocks?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadStocks();
      }
    } catch (error) {
      console.error('Failed to delete stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">📈 股票仪表盘</h1>
          <div className="flex gap-3">
            <button
              onClick={() => refreshQuotes()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              刷新
            </button>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              预警
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              + 添加股票
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {lastUpdate && (
          <p className="text-gray-400 text-sm mb-4">最后更新: {lastUpdate}</p>
        )}

        {stocks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">暂无自选股</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              添加第一只股票
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                quote={quotes[stock.code]}
                onDelete={() => handleDeleteStock(stock.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStock}
        />
      )}

      {showAlerts && (
        <AlertsPanel onClose={() => setShowAlerts(false)} stocks={stocks} />
      )}
    </div>
  );
}
