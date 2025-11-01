import 'dotenv/config';
import { createPublicClient, http, parseAbi } from 'viem';

const client = createPublicClient({ transport: http(process.env.ZIRCUIT_RPC_URL!) });
const abi = parseAbi(['function balanceOf(address account, uint256 id) view returns (uint256)']);
const addr = process.env.BOOKS1155_ADDRESS as `0x${string}`;
const user = '0xa17f2768d7B79C5dDA23521B09822b78a81B8a5d';
const tokenId = 1001n;

const bal = await client.readContract({ address: addr, abi, functionName: 'balanceOf', args: [user, tokenId] });
console.log('🔹 NFT Balance:', bal.toString());
