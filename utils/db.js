const fs = require('fs');
const path = require('path');

function readJSON(filePath) {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filePath, data) {
  const abs = path.resolve(filePath);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(abs, content, 'utf-8');
}

module.exports = { readJSON, writeJSON };
