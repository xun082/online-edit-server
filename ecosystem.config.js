module.exports = {
  apps: [
    {
      name: 'online-editor-server', // 应用的名称
      script: 'dist/main.js', // 编译后的入口文件路径

      // 默认环境（开发环境）
      env: {
        NODE_ENV: 'development',
      },

      // 生产环境
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
