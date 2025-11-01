require('dotenv').config();
const crypto = require('crypto');

// 一律修改這個 payload（你要送什麼就寫什麼）
const payload = {
  order_id: 'o_002',
  platform_user_id: 'u_123',
  sku_id: '1001',
  regulated: false,
  quantity: 1
};

const body = JSON.stringify(payload);                  // 跟後端 JSON.stringify 一致
const secret = process.env.WEBHOOK_SHARED_SECRET || ''; // 一定要跟 .env 一樣
if (!secret) {
  console.error('WEBHOOK_SHARED_SECRET 未設定，請檢查 backend/.env');
  process.exit(1);
}

const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
console.log('signature =', sig);

// Node 18+ 內建 fetch
(async () => {
  const res = await fetch('http://localhost:3000/webhooks/order.created', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-webhook-signature': sig,
    },
    body
  });
  const text = await res.text();
  console.log('status', res.status, 'body', text);
})();
