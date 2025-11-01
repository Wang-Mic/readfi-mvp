const crypto = require('crypto');
const secret = 'change-me'; // 要與 .env 中 WEBHOOK_SHARED_SECRET 相同

const body = JSON.stringify({
  order_id: 'o_001',
  platform_user_id: 'u_123',
  sku_id: '1001',
  regulated: false,
  quantity: 1,
});

const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
console.log('Generated Signature:', sig);
