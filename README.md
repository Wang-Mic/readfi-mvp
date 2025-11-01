# ReadFi MVP Starter (Zircuit + Oasis, No Sui)

This starter gets you through **T–0 基礎環境** so you can immediately begin step 1.
It contains two repos in one workspace:

- `contracts/` — Hardhat (Solidity 0.8.24) with dotenv + toolbox
- `backend/` — Fastify + TypeScript, Docker Compose for Postgres + Redis

> Node.js 20+, pnpm 9+ (or npm), Docker 24+ recommended.

---

## Quickstart

```bash
# 1) Clone or unzip this folder
cd readfi-mvp-starter

# 2) Spin up DB & Queue (Postgres, Redis)
docker compose up -d

# 3) Contracts: install & compile
cd contracts
pnpm i      # or: npm i
cp .env.example .env
pnpm hardhat compile

# 4) Backend: install & run
cd ../backend
pnpm i      # or: npm i
cp .env.example .env
pnpm dev
```

### Verify
- Visit `http://localhost:3000/healthz` → should return `{ status: "ok" }`
- `pnpm hardhat test` in `contracts/` should pass basic sanity.

---

## Environment Variables

### `contracts/.env`

```
ZIRCUIT_RPC_URL=YOUR_ZIRCUIT_TESTNET_RPC
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_WITH_TEST_FUNDS
ETHERSCAN_API_KEY=optional
```

> **Note:** Keep PRIVATE_KEY to a *throwaway* test key only.

### `backend/.env`

```
PORT=3000
NODE_ENV=development

DATABASE_URL=postgres://postgres:postgres@localhost:5432/readfi
REDIS_URL=redis://localhost:6379

ZIRCUIT_RPC_URL=YOUR_ZIRCUIT_TESTNET_RPC
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_WITH_TEST_FUNDS

# CORS/WEBHOOK
WEBHOOK_SHARED_SECRET=change-me
```

---

## What’s inside

- **contracts/**
  - Hardhat config with `@nomicfoundation/hardhat-toolbox` and dotenv
  - Example contracts:
    - `READToken.sol` (ERC20 + burn + pause)
    - `ReadFiBooks1155.sol` (minimal ERC1155 with baseURI)
  - Scripts under `scripts/deploy` (skeletons)

- **backend/**
  - Fastify + TS
  - Minimal modules:
    - `/healthz`
    - `/webhooks/order.created` (skeleton + HMAC verify middleware)
  - `docker-compose.yml` for Postgres + Redis

---

## Next steps (after T–0)

1. **Step 1** — Implement READToken logic + tests, add `EmissionController`.
2. **Step 2** — Implement ERC1155 + minting test.
3. **Step 3** — RoyaltySplitter + unit tests.
4. **Step 4** — Fill Mint Service flow (Webhook → Queue → Mint → Callback).
5. **Step 5** — Oasis KeyBroker proxy in backend.

See your action plan for details.
