import 'dotenv/config';
import Redis from 'ioredis';
import pg from 'pg';
import { z } from 'zod';
import { createPublicClient, createWalletClient, http, parseAbi, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const RPC = process.env.ZIRCUIT_RPC_URL!;
const PK = process.env.PRIVATE_KEY as `0x${string}`;
const BOOKS1155 = getAddress(process.env.BOOKS1155_ADDRESS!);

if (!RPC || !PK || !BOOKS1155) {
  console.error('Missing env: ZIRCUIT_RPC_URL / PRIVATE_KEY / BOOKS1155_ADDRESS');
  process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const account = privateKeyToAccount(PK);
const chain = {
  id: 48898, // Zircuit Testnet（如有不同請改）
  name: 'zircuitTestnet',
  rpcUrls: { default: { http: [RPC] } },
} as const;

const publicClient = createPublicClient({ chain, transport: http(RPC) });
const walletClient = createWalletClient({ account, chain, transport: http(RPC) });

const ERC1155_ABI = parseAbi([
  'function safeMint(address to, uint256 id, uint256 amount, bytes data) external',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
]);

const Order = z.object({
  order_id: z.string(),
  platform_user_id: z.string(),
  sku_id: z.string(),              // 當作 tokenId
  regulated: z.boolean().optional().default(false),
  quantity: z.number().optional().default(1),
});

// MVP：先把平台 user 映射成 signer 自己；之後再改 DB/託管錢包
async function mapUserToEvmAddress(_platformUserId: string): Promise<`0x${string}`> {
  return account.address;
}

async function handleOrder(raw: string) {
  const data = Order.parse(JSON.parse(raw));
  const to = await mapUserToEvmAddress(data.platform_user_id);
  const tokenId = BigInt(data.sku_id);

  console.log(`[worker] Minting tokenId=${tokenId} to ${to} ...`);

  const hash = await walletClient.writeContract({
    address: BOOKS1155,
    abi: ERC1155_ABI,
    functionName: 'safeMint',
    args: [to, tokenId, 1n, '0x'],
  });

  console.log(`[worker] tx sent: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`[worker] tx confirmed in block ${receipt.blockNumber}`);

  // 記錄到 DB（可重跑覆蓋）
  try {
    await pool.query(
      `insert into nft_mints(order_id, address, token_id, chain_tx, type, status)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (order_id) do update set chain_tx=$4, status=$6`,
      [data.order_id, to, String(tokenId), hash, '1155', 'MINTED']
    );
  } catch (e) {
    console.error('[worker] DB insert error:', e);
  }
}

async function main() {
  console.log('[worker] started, queue=orders:pending');
  for (;;) {
    try {
      const raw = await redis.rpop('orders:pending');
      if (raw) {
        await handleOrder(raw);
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (e) {
      console.error('[worker] loop error:', e);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

main().catch((e) => {
  console.error('[worker] fatal:', e);
  process.exit(1);
});
