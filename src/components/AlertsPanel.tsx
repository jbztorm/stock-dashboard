'use client';

import { useState, useEffect } from 'react';

interface Stock {
  id: string;
  code: string;
  name: string;
  market: string;
}

interface Alert {
  id: string;
  stock_id: string;
  alert_type: string;
  threshold: number;
  enabled: boolean;
  stocks?: Stock;
}

interface AlertsPanelProps {
  onClose: () => void;
  stocks: Stock[];
}

export default function AlertsPanel({ onClose, stocks }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAlert, setNewAlert] = useState({
    stock_id: '',
    alert_type: '涨幅',
    threshold: 5,
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const json = await res.json();
      if (json.success) {
        setAlerts(json.data || []);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.stock_id || !newAlert.threshold) {
      alert('请选择股票和设置阈值');
      return;
    }

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
      
      const json = await res.json();
      if (json.success) {
        loadAlerts();
        setShowAdd(false);
        setNewAlert({ stock_id: '', alert_type: '涨幅', threshold: 5 });
      } else {
        alert(json.error || 'Failed to add alert');
      }
    } catch (error) {
      console.error('Failed to add alert:', error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadAlerts();
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const handleToggleAlert = async (id: string, enabled: boolean) => {
    // TODO: 实现 toggle 功能
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">涨跌幅预警</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* 预警列表 */}
        {loading ? (
          <div className="text-gray-400 text-center py-8">加载中...</div>
        ) : alerts.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <p>暂无预警配置</p>
            <p className="text-sm mt-2">添加预警，当股票涨跌幅达到阈值时自动通知</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {alert.stocks?.name || alert.stock_id} ({alert.stocks?.code})
                  </p>
                  <p className="text-sm text-gray-400">
                    {alert.alert_type}超过 {alert.threshold}%
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 添加预警 */}
        {showAdd ? (
          <form onSubmit={handleAddAlert} className="border-t border-gray-700 pt-4">
            <h3 className="text-white font-medium mb-3">添加新预警</h3>
            
            <div className="mb-3">
              <label className="block text-sm text-gray-400 mb-1">股票</label>
              <select
                value={newAlert.stock_id}
                onChange={(e) => setNewAlert({ ...newAlert, stock_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              >
                <option value="">选择股票</option>
                {stocks.map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name} ({stock.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-400 mb-1">预警类型</label>
              <select
                value={newAlert.alert_type}
                onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              >
                <option value="涨幅">涨幅预警</option>
                <option value="跌幅">跌幅预警</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">
                阈值 (%) - 当前 {newAlert.alert_type === '涨幅' ? '≥' : '≤'} {newAlert.threshold}%
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1%</span>
                <span className="text-white font-medium">{newAlert.threshold}%</span>
                <span>20%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                添加
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            + 添加预警
          </button>
        )}
      </div>
    </div>
  );
}
