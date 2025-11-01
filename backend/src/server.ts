// backend/src/server.ts（節錄）
import type { FastifyInstance, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import pg from 'pg';
import Redis from 'ioredis';
import { apiRoutes } from './routes/api';  // ← 新增引入

function verifyHmac(req: FastifyRequest, secret: string) {
  const sig = req.headers['x-webhook-signature'] as string | undefined;
  if (!sig) return false;
  const body = JSON.stringify(req.body ?? {});
  const mac = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(mac));
}

export async function createServer(app: FastifyInstance) {
  // DB & Redis
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  await redis.connect();

  // 你原本的 Health/Webhook/Admin endpoints ...
  app.get('/healthz', async () => ({ status: 'ok' }));
  app.post('/webhooks/order.created', async (req, reply) => {
    const ok = verifyHmac(req, process.env.WEBHOOK_SHARED_SECRET || '');
    if (!ok) return reply.code(401).send({ error: 'bad signature' });
    const payload = req.body as any;
    await redis.lpush('orders:pending', JSON.stringify(payload));
    return { accepted: true };
  });
  app.post('/admin/bootstrap', async () => {
    await pool.query(`
      create table if not exists orders (
        order_id text primary key,
        platform_user_id text not null,
        sku_id text not null,
        regulated boolean default false,
        status text default 'PENDING',
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
    `);
    await pool.query(`
      create table if not exists nft_mints (
        order_id text primary key,
        address text not null,
        token_id text not null,
        chain_tx text,
        type text,
        status text,
        created_at timestamptz default now()
      );
    `);
    // 也可在這裡建 key_sessions / nonces 表，若你選擇用 Postgres 存
    return { ok: true };
  });

  // 你原本的 /books 與 /key/* 路由仍然保留…

  // 🔗 註冊新增的 API 集合（SiWE、metadata、list-by-owner、tx 等）
  await app.register(apiRoutes);
}
