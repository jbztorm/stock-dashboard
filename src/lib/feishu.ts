// 飞书消息推送工具

const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL || '';

interface FeishuMessage {
  msg_type: string;
  content: {
    text?: string;
    post?: any;
  };
}

export async function sendFeishuMessage(message: string): Promise<boolean> {
  if (!FEISHU_WEBHOOK_URL) {
    console.log('[Feishu] Webhook URL not configured, skipping:', message);
    return false;
  }

  try {
    const payload: FeishuMessage = {
      msg_type: 'text',
      content: {
        text: message,
      },
    };

    const response = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('[Feishu] Message sent successfully');
      return true;
    } else {
      console.error('[Feishu] Failed to send message:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[Feishu] Error sending message:', error);
    return false;
  }
}

// 发送股票预警消息
export async function sendStockAlert(
  stockName: string,
  stockCode: string,
  price: number,
  changePercent: number,
  alertType: '涨幅' | '跌幅'
): Promise<boolean> {
  const emoji = changePercent > 0 ? '📈' : '📉';
  const message = `${emoji} 股票预警\n\n${stockName} (${stockCode}) 触发${alertType}预警！\n当前价格: ¥${price.toFixed(2)}\n涨跌幅: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
  
  return sendFeishuMessage(message);
}
