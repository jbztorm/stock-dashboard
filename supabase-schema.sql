-- Stock Dashboard Database Schema for Supabase

-- 自选股表
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,  -- 股票代码，如 600519（A股）、AAPL（美股）
  name VARCHAR(100) NOT NULL,         -- 股票名称
  market VARCHAR(10) NOT NULL,         -- 市场类型: 'A股', '港股', '美股'
  exchange VARCHAR(20),               -- 交易所: 'SSE', 'SZSE', 'NASDAQ', 'NYSE'
  currency VARCHAR(10) DEFAULT 'CNY', -- 货币: CNY, USD, HKD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 股票日线数据
CREATE TABLE IF NOT EXISTS daily_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open NUMERIC(12, 2),
  high NUMERIC(12, 2),
  low NUMERIC(12, 2),
  close NUMERIC(12, 2),
  volume BIGINT,
  amount NUMERIC(20, 2),
  change_percent NUMERIC(10, 4),
  ma5 NUMERIC(12, 2),
  ma10 NUMERIC(12, 2),
  ma20 NUMERIC(12, 2),
  ma60 NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stock_id, date)
);

-- 涨跌幅预警配置
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL,    -- '涨幅', '跌幅'
  threshold NUMERIC(10, 2) NOT NULL,  -- 阈值百分比
  enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 预警触发记录
CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  triggered_price NUMERIC(12, 2),
  change_percent NUMERIC(10, 4),
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_data_stock_date ON daily_data(stock_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_stock ON alerts(stock_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_alert ON alert_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_created ON alert_logs(created_at DESC);

-- 启用 Row Level Security
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

-- 公开读取策略（用于演示）
CREATE POLICY "Public read stocks" ON stocks FOR SELECT USING (true);
CREATE POLICY "Public read daily_data" ON daily_data FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public read alert_logs" ON alert_logs FOR SELECT USING (true);

-- 写入策略（通过 API）
CREATE POLICY "Service write stocks" ON stocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Service write daily_data" ON daily_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Service write alerts" ON alerts FOR ALL USING (true);
CREATE POLICY "Service write alert_logs" ON alert_logs FOR ALL USING (true);
