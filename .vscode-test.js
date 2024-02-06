const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: 'out/**/vscode-tests/*.test.js',
  workspaceFolder: 'src/vscode-tests/resources',
  mocha: {
    ui: 'tdd',
    timeout: 10000,
  },
});
