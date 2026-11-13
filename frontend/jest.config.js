module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '\\.css$': 'identity-obj-proxy',
    },
    transformIgnorePatterns: [
      '/node_modules/',
      '^.+\\.module\\.css$',
    ],
  };  