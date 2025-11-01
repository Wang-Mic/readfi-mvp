// usage:
//   node scripts/extractMetadata.cjs ReadFiMintGateway contracts/ReadFiMintGateway.sol
// output:
//   ./metadata.ReadFiMintGateway.json

const fs = require('fs');
const path = require('path');

const [,, contractName, sourcePath] = process.argv;
if (!contractName || !sourcePath) {
  console.error('Usage: node scripts/extractMetadata.cjs <ContractName> <sourcePath>');
  process.exit(1);
}

const buildInfoDir = path.join(__dirname, '..', 'artifacts', 'build-info');
const files = fs.readdirSync(buildInfoDir).filter(f => f.endsWith('.json'));
if (!files.length) {
  console.error('No build-info json found under artifacts/build-info');
  process.exit(1);
}

let found = null;
for (const f of files) {
  const p = path.join(buildInfoDir, f);
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  const out = json?.output?.contracts?.[sourcePath]?.[contractName];
  if (out?.metadata) {
    found = out.metadata; // note: this is a JSON string!
    break;
  }
}

if (!found) {
  console.error(`metadata for ${contractName} in ${sourcePath} not found. Check names/paths.`);
  process.exit(1);
}

// found is a stringified JSON; parse & pretty-print
const metadataObj = JSON.parse(found);
const outFile = path.join(process.cwd(), `metadata.${contractName}.json`);
fs.writeFileSync(outFile, JSON.stringify(metadataObj, null, 2), 'utf8');

console.log(`✅ Wrote ${outFile}`);
console.log(`ℹ️  Detected compiler: ${metadataObj?.compiler?.version || 'unknown'}`);
