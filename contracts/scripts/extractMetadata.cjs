// contracts/scripts/extractMetadata.cjs
// 用法：node scripts/extractMetadata.cjs <ContractName> <SourcePath>
// 範例：node scripts/extractMetadata.cjs ReadFiComplianceManager contracts/ReadFiComplianceManager.sol

const fs = require('fs');
const path = require('path');

function findBuildInfos(dir) {
  const p = path.resolve(dir);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(p, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs); // 新到舊
}

function extractMetadata(contractName, sourcePath) {
  const buildInfos = findBuildInfos('./artifacts/build-info');
  if (buildInfos.length === 0) {
    throw new Error('找不到 artifacts/build-info，請先跑 hardhat compile。');
  }

  let hit = null;
  let buildInfoJson = null;

  for (const f of buildInfos) {
    const raw = fs.readFileSync(f, 'utf8');
    const obj = JSON.parse(raw);
    const out = obj?.output?.contracts || {};
    if (out[sourcePath] && out[sourcePath][contractName]) {
      hit = out[sourcePath][contractName];
      buildInfoJson = obj;
      break;
    }
  }

  if (!hit) {
    throw new Error(`在 build-info 找不到合約：${contractName} @ ${sourcePath}
請確認名稱與路徑是否正確，並已完成編譯。`);
  }

  // Hardhat 的 metadata 通常是「字串」
  let md;
  if (typeof hit.metadata === 'string') {
    try {
      md = JSON.parse(hit.metadata);
    } catch (e) {
      throw new Error('metadata 不是有效的 JSON 字串。');
    }
  } else if (typeof hit.metadata === 'object') {
    md = hit.metadata;
  } else {
    md = {};
  }

  // 補上 compiler 與 language 欄位（Blockscout/Sourcify 會要求）
  const solcVersion = buildInfoJson?.solcVersion || md?.compiler?.version || '';
  md.compiler = md.compiler || {};
  if (!md.compiler.version && solcVersion) {
    md.compiler.version = solcVersion; // e.g. "0.8.24+commit.e11b9ed9"
  }
  if (!md.language) {
    md.language = 'Solidity';
  }

  // 輸出到 artifacts/metadata/
  const outDir = path.resolve('./artifacts/metadata');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `metadata.${contractName}.json`);
  fs.writeFileSync(outFile, JSON.stringify(md, null, 2), 'utf8');

  // 另外也順手輸出 ABI 與 bytecode（有時候上傳驗證用得到）
  const abi = hit.abi || [];
  const bytecode = hit.evm?.bytecode?.object || '';
  const deployedBytecode = hit.evm?.deployedBytecode?.object || '';

  fs.writeFileSync(path.join(outDir, `${contractName}.abi.json`), JSON.stringify(abi, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, `${contractName}.bytecode.txt`), bytecode, 'utf8');
  fs.writeFileSync(path.join(outDir, `${contractName}.deployedBytecode.txt`), deployedBytecode, 'utf8');

  console.log('✅ 生成完成：');
  console.log(`- ${path.relative(process.cwd(), outFile)}`);
  console.log(`- artifacts/metadata/${contractName}.abi.json`);
  console.log(`- artifacts/metadata/${contractName}.bytecode.txt`);
  console.log(`- artifacts/metadata/${contractName}.deployedBytecode.txt`);
  console.log(`compiler.version = ${md.compiler.version}`);
}

const [,, name, src] = process.argv;
if (!name || !src) {
  console.error('用法：node scripts/extractMetadata.cjs <ContractName> <SourcePath>');
  process.exit(1);
}
extractMetadata(name, src);
