// craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@graphql': path.resolve(__dirname, 'src/graphql'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
    }
  }
};