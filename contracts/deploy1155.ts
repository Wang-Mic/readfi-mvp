import 'dotenv/config';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { zircuitTestnet } from 'viem/chains';
import fs from 'fs';

// ✅ 讀取編譯後 artifact (ABI + bytecode)
const artifactPath = './artifacts/contracts/ReadFiBooks1155.sol/ReadFiBooks1155.json';
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

const abi = artifact.abi;
const bytecode = artifact.bytecode;

// ✅ 讀取私鑰與 RPC URL
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const rpcUrl = process.env.ZIRCUIT_RPC_URL!;
if (!privateKey || !rpcUrl) {
  console.error('❌ 請在 .env 設定 PRIVATE_KEY 與 ZIRCUIT_RPC_URL');
  process.exit(1);
}

// ✅ 初始化帳號與鏈
const account = privateKeyToAccount(privateKey);
const client = createWalletClient({
  account,
  chain: zircuitTestnet,
  transport: http(rpcUrl),
});

// ✅ 主程式
const main = async () => {
  console.log('🚀 Deploying ReadFiBooks1155 from', account.address);
  const hash = await client.deployContract({
    abi,
    bytecode,
    args: [], // 若合約建構子有參數，填在這裡
  });

  console.log('⛓️ Transaction hash:', hash);

  // 等待交易上鍊
  const receipt = await client.waitForTransactionReceipt({ hash });
  console.log('✅ Contract deployed at:', receipt.contractAddress);
};

main().catch((err) => {
  console.error('❌ Deploy failed:', err);
});
