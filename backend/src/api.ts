// backend/src/routes/api.ts
import type { FastifyInstance } from 'fastify';
import 'dotenv/config';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { SiweMessage } from 'siwe';
import { createPublicClient, http, parseAbi, getAddress } from 'viem';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const publicClient = createPublicClient({ transport: http(process.env.ZIRCUIT_RPC_URL!) });
const CHAIN_ID = Number(process.env.CHAIN_ID || '48898');
const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || 'readfi-dev-secret';
const BOOKS1155 = getAddress(process.env.BOOKS1155_ADDRESS!);

const ERC1155_ABI = parseAbi([
  'function balanceOf(address account, uint256 id) view returns (uint256)',
]);

function randomId(n = 16) {
  return crypto.randomBytes(n).toString('hex');
}

export async function apiRoutes(app: FastifyInstance) {
  // ---- 健康檢查（沿用）
  app.get('/healthz', async () => ({ status: 'ok' }));

  // ---- SiWE：取得 nonce
  app.post('/api/auth/siwe/nonce', async (req, reply) => {
    const nonce = `siwe:${randomId(16)}`;
    await redis.setex(`siwe:nonce:${nonce}`, 300, '1'); // 5 分鐘
    return {
      nonce,
      domain: req.headers.host,
      chainId: CHAIN_ID,
      statement: 'Sign in to ReadFi',
      uri: `http://${req.headers.host ?? 'localhost:3000'}`,
      issuedAt: new Date().toISOString(),
    };
  });

  // ---- SiWE：驗證並簽發 JWT
  app.post('/api/auth/siwe/verify', async (req, reply) => {
    const { message, signature } = (req.body || {}) as { message?: string; signature?: string };
    if (!message || !signature) return reply.code(400).send({ error: 'missing fields' });
    try {
      const siwe = new SiweMessage(message);
      const fields = await siwe.verify({ signature });
      const used = await redis.get(`siwe:nonce:${fields.data.nonce}`);
      if (!used) return reply.code(401).send({ error: 'nonce expired/used' });
      await redis.del(`siwe:nonce:${fields.data.nonce}`);
      const address = getAddress(fields.data.address);
      const token = jwt.sign({ sub: address.toLowerCase(), typ: 'siwe' }, AUTH_JWT_SECRET, { expiresIn: '15m' });
      return { token, expires_in: 900 };
    } catch (e: any) {
      return reply.code(401).send({ error: 'siwe verify failed', detail: e?.message });
    }
  });

  // ---- 書籍 Metadata（ERC 標準 + 內容雜湊）
  const BOOK_METADATA: Record<string, any> = {
    '1001': {
      name: 'The Future of Reading',
      description: 'A short essay on decentralized reading ownership.',
      image: 'https://cdn.readfi.app/books/1001.jpg',
      attributes: [{ trait_type: 'rwa_type', value: 'digital_book' }],
      content_sha256: 'REPLACE_WITH_REAL_SHA256_HEX',
    },
  };

  app.get('/api/books/metadata/:id', async (req, reply) => {
    const id = (req.params as any).id as string;
    const meta = BOOK_METADATA[id];
    if (!meta) return reply.code(404).send({ error: 'metadata not found' });
    return meta;
  });

  // ---- 我的書庫（別名 → 你既有的 /books?user=）
  app.get('/api/books/list-by-owner', async (req, reply) => {
    const user = (req.query as any).user as string | undefined;
    if (!user) return reply.code(400).send({ error: 'missing user' });
    const res = await app.inject({ method: 'GET', url: `/books?user=${encodeURIComponent(user)}` });
    reply.code(res.statusCode).headers(res.headers()).send(res.body);
  });

  // ---- 交易查詢（薄封裝）
  app.get('/api/transactions/:txHash', async (req, reply) => {
    const txHash = (req.params as any).txHash as `0x${string}`;
    try {
      const rcpt = await publicClient.getTransactionReceipt({ hash: txHash });
      return {
        status: rcpt.status === 'success' ? 'success' : 'reverted',
        blockNumber: Number(rcpt.blockNumber),
        from: rcpt.from,
        to: rcpt.to,
        gasUsed: rcpt.gasUsed?.toString(),
        contractAddress: rcpt.contractAddress ?? null,
      };
    } catch (e: any) {
      return reply.code(404).send({ error: 'tx not found', detail: e?.message });
    }
  });

  // ---- 擁有權檢查（對齊對方命名 C-3）
  app.get('/api/books/is-owner', async (req, reply) => {
    const { user, tokenId } = (req.query || {}) as { user?: string; tokenId?: string };
    if (!user || !tokenId) return reply.code(400).send({ error: 'missing user/tokenId' });
    const bal = await publicClient.readContract({
      address: BOOKS1155,
      abi: ERC1155_ABI,
      functionName: 'balanceOf',
      args: [getAddress(user), BigInt(tokenId)],
    });
    return { isOwner: (bal as bigint) > 0n };
  });

  // ---- （可選）內容 meta：若 IV/TAG 沒包在檔頭
  app.get('/content/:id/meta', async (_req, reply) => {
    return reply.code(501).send({ error: 'not implemented in MVP' });
  });
}
