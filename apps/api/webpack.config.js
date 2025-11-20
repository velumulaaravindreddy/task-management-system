const { composePlugins, withNx } = require('@nx/webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = composePlugins(withNx(), (config) => {
  // Resolve TypeScript path mappings
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.plugins) {
    config.resolve.plugins = [];
  }
  config.resolve.plugins.push(
    new TsconfigPathsPlugin({
      configFile: require.resolve('./tsconfig.app.json'),
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    })
  );
  return config;
});

