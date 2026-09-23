const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building AstroGuru Admin Web Portal...');
execSync('npm --prefix admin-web run build', { stdio: 'inherit' });

console.log('🌟 Building AstroGuru Landing Web Portal...');
execSync('npm --prefix landing-web run build', { stdio: 'inherit' });

// Copy admin-web/dist into landing-web/dist/admin so /admin works on any static host / Vercel
const adminDist = path.join(__dirname, '../admin-web/dist');
const targetAdminDir = path.join(__dirname, '../landing-web/dist/admin');

if (fs.existsSync(adminDist)) {
  console.log('📦 Embedding Admin Portal build into landing-web/dist/admin...');
  if (!fs.existsSync(targetAdminDir)) {
    fs.mkdirSync(targetAdminDir, { recursive: true });
  }
  fs.cpSync(adminDist, targetAdminDir, { recursive: true });
  console.log('✅ Admin Portal embedded at /admin successfully!');
}
