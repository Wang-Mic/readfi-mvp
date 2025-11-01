# 📚 ReadFi MVP

> **ReadFi** 是一個結合 **去中心化身份（Self / Celo）**、**隱私運算（Oasis Sapphire + OPL）** 與 **合規代幣化標準（ERC-3643）** 的出版與閱讀平台。
> 用戶能以最小揭露方式完成身份驗證，安全地持有、轉售與分潤電子書資產，並於區塊鏈上驗證其合法性與隱私性。

---

## 🧩 專案總覽

| 模組                            | 描述                                                 | 狀態                  |
| ----------------------------- | -------------------------------------------------- | ------------------- |
| **Self Integration**          | 整合 Self SDK，生成 Verifiable Credential（年齡、國家、非制裁名單）。 | 🚧 進行中              |
| **Oasis OPL / Sapphire**      | 機密驗證與合規檢查邏輯執行於 TEE；主鏈讀取布林結果。                       | ✅ 已建構並測試            |
| **Zircuit L2**                | 智能合約部署與驗證，包含 ReadFiComplianceManagerV2。            | ✅ 完成部署與 Sourcify 驗證 |
| **ERC-3643 機制**               | 代幣合規層：身份驗證 + 受管制轉帳控制（ReadFiComplianceManager）。     | ✅ 已整合               |
| **Read Token (READToken)**    | 平台內部支付與獎勵代幣。                                       | ✅ 完成             |
| **Books1155 NFT**             | 代表電子書或收益權的 ERC-1155 NFT。                           | ✅ 完成              |
| **Backend / Webhook Gateway** | 接收前端指令、簽章驗證、呼叫合約執行交易。                              | ✅ 初版完成              |
| **Frontend DApp**             | 登入、認證與閱讀入口（連結錢包）。                                  | 🕓 待整合              |

---

## 🧱 架構概覽（目標最終版）

```
[User Wallet / DApp]
│
▼
[Self SDK] → DID + Verifiable Credential (Age, Country, Non-OFAC)
│
▼
[Oasis Sapphire / OPL Gateway]
├─ Verify VC validity in TEE
└─ Return compliance bool → Mainnet
│
▼
[Zircuit L2 Smart Contracts]
├─ ERC-3643 (ReadFiComplianceManagerV2)
├─ READToken (ERC-20)
├─ Books1155 (ERC-1155)
└─ MintGateway (書籍發行／驗證閘口)
│
▼
[Backend API]
├─ Webhook / Event Queue
├─ Mint worker / Server.ts
└─ Metadata extraction / verification
```

---

## ⚙️ 目前實際進度架構圖

```
[Frontend (DApp)] 🚧
│ Webhook/API 呼叫
▼
[Backend Gateway] ✅
├─ server.ts / mintWorker.ts
└─ 簽章驗證與合約觸發
│
▼
[Contracts on Zircuit] ✅
├─ ReadFiComplianceManagerV2.sol ✅
├─ READToken.sol 🚧
├─ ReadFiBooks1155.sol 🚧
└─ ReadFiMintGateway.sol ✅
│
▼
[Oasis Sapphire / OPL] ✅
├─ 合規驗證 (ComplianceGateway.sol)
└─ 回傳結果給主鏈
│
▼
[Self SDK (Celo)] 🚧
└─ 生成與驗證 VC（年齡 / 地區 / 非制裁）
```

---

## 🧠 合約資訊（Zircuit Testnet）

| 合約名稱                          | 地址                                                                                                                                               | 狀態           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| **ReadFiComplianceManagerV2** | [`0x5Fee6b7fC067FcA597f378ce343AE2fcda5f69A1`](https://repo.sourcify.dev/contracts/full_match/48898/0x5Fee6b7fC067FcA597f378ce343AE2fcda5f69A1/) | ✅ Verified   |
| **ComplianceGateway**         | （Oasis Sapphire）                                                                                                                                 | ✅ Completed  |
| **ReadFiMintGateway**         | 本地部署測試版                                                                                                                                          | ✅ Functional |
| **READToken**                 | —                                                                                                                                                | 0xC209cB5630507cbAB855e05D2ad3eE1a67Ed1e79       |
| **Books1155**                 | —                                                                                                                                                | 0xa17f2768d7B79C5dDA23521B09822b78a81B8a5d       |

---

## 📂 專案結構

```
readfi-mvp/
├── backend/
│   ├── server.ts
│   ├── mintWorker.ts
│   ├── verifyVC.js
│   └── sign.cjs / sendWebhook.cjs
│
├── contracts/
│   ├── contracts/
│   │   ├── READToken.sol
│   │   ├── ReadFiBooks1155.sol
│   │   ├── ReadFiComplianceManagerV2.sol
│   │   ├── ComplianceGateway.sol
│   │   └── ReadFiMintGateway.sol
│   ├── scripts/
│   │   ├── deploy/*.ts
│   │   └── verify.cjs / extractMetadata.cjs
│   └── hardhat.config.cjs
│
├── frontend/ (即將新增)
├── README.md
└── .gitignore
```

---

## 🚀 執行方式

**安裝依賴：**

```bash
pnpm install
```

**編譯與部署（Hardhat）：**

```bash
cd contracts
pnpm hardhat compile
pnpm hardhat run scripts/deploy/02_books1155.ts --network zircuitTestnet
```

**驗證合約：**

```bash
pnpm hardhat verify --network zircuitTestnet <合約地址> <參數...>
```

**啟動後端：**

```bash
cd backend
pnpm dev
```

---

## 🗓️ Roadmap（開發時間線）

| 階段      | 目標                               | 時間      | 狀態     |
| ------- | -------------------------------- | ------- | ------ |
| Phase 1 | 完成 ERC-3643 合約、Oasis 驗證邏輯        | 2025 Q1 | ✅ Done |
| Phase 2 | 整合 Self SDK、READToken 與 1155 NFT | 2025 Q2 | 🚧 進行中 |
| Phase 3 | DApp 前端 UI、使用者登入與錢包互動            | 2025 Q3 | ⏳ 計畫中  |
| Phase 4 | 正式 Demo 與社群測試版上線                 | 2025 Q4 | ⏳ 計畫中  |

---

## 🏁 Hackathon / Demo 提交資訊

| 項目            | 內容                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 🧱 網絡         | Zircuit Testnet / Oasis Sapphire                                                                                                |

---

## 🧩 技術棧

* Solidity / Hardhat / OpenZeppelin Upgrades
* Ethers.js v6 / TypeScript
* Oasis Sapphire + OPL (TEE Confidential Contracts)
* Self Onchain SDK (DID + VC)
* ERC-3643 規範代幣與身份管控
* pnpm / Docker Compose
* Node.js Express Backend

---

## 🧭 專案願景

ReadFi 旨在建立：

*  **去中心化出版與閱讀市場** — 讓作者、出版者、讀者直接互動
*  **隱私友善的身份驗證機制** — 用戶自主掌控個資
*  **合規資產化的收益分潤系統** — 支援 RWA 與投資型內容
*  **跨鏈延展性** — 可延伸至 Celo、Oasis、Zircuit、以太坊主網

---

##  授權

本專案以 **MIT License** 授權。
