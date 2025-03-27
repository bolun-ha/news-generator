const { execSync } = require('child_process');

try {
  console.log('开始构建...');
  // 使用 Node.js 的 child_process 来运行命令
  execSync('node ./node_modules/next/dist/bin/next build', { stdio: 'inherit' });
  console.log('构建完成！');
} catch (error) {
  console.error('构建失败:', error);
  process.exit(1);
}