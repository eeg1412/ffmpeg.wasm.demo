const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 端口号8078
  devServer: {
    port: 8078,
  },
})
