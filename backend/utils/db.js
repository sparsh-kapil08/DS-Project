const fs = require('fs');
const path = require('path');

function getVercelPath(filePath) {
  if (process.env.VERCEL) {
    const filename = path.basename(filePath);
    const tmpPath = path.join('/tmp', filename);
    if (!fs.existsSync(tmpPath)) {
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, tmpPath);
      } else {
        fs.writeFileSync(tmpPath, '[]');
      }
    }
    return tmpPath;
  }
  return filePath;
}

function readJSON(filePath) {
  const targetPath = getVercelPath(path.resolve(filePath));
  const raw = fs.readFileSync(targetPath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filePath, data) {
  const targetPath = getVercelPath(path.resolve(filePath));
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(targetPath, content, 'utf-8');
}

module.exports = { readJSON, writeJSON };
