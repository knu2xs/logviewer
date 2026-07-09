import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve('tests/e2e/fixtures/logs');
const targetPath = path.join(targetDir, 'synthetic_50000.log');
const totalRows = 50000;
const baseTime = new Date('2026-07-09T00:00:00Z').getTime();
const levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
const loggers = ['Portal.Security', 'Portal.Indexer', 'Portal.Sync', 'ArcGIS.Server', 'App.Worker'];

function formatTimestamp(value) {
  const date = new Date(value);
  const pad = (segment) => String(segment).padStart(2, '0');

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

mkdirSync(targetDir, { recursive: true });

const lines = [];
for (let index = 0; index < totalRows; index += 1) {
  const timestamp = formatTimestamp(baseTime + index * 1000);
  const logger = loggers[index % loggers.length];
  const level = levels[index % levels.length];
  const message = `Synthetic event ${index + 1} for responsiveness checks`;
  lines.push(`${timestamp} | ${logger} | ${level} | ${message}`);
}

writeFileSync(targetPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`Generated ${totalRows} rows at ${targetPath}`);