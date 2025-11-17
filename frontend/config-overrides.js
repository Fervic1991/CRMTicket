const path = require("path");

module.exports = function override(config) {
  // Remove ESLintWebpackPlugin para CRA 5
  config.plugins = config.plugins.filter(
    plugin => plugin.constructor.name !== "ESLintWebpackPlugin"
  );

  // Transpila libs ESM problemáticas
  const oneOf = config.module.rules.find(r => Array.isArray(r.oneOf));
  if (oneOf) {
    // Adiciona regra para transpilar módulos problemáticos
    oneOf.oneOf.unshift({
      test: /\.m?jsx?$/,
      include: [
        path.resolve(__dirname, "node_modules/fast-png"),
        path.resolve(__dirname, "node_modules/iobuffer"),
      ],
      loader: require.resolve("babel-loader"),
      options: {
        presets: [
          [
            require.resolve("babel-preset-react-app"),
            {
              runtime: "automatic"
            }
          ]
        ],
        plugins: [
          [
            require.resolve("@babel/plugin-proposal-class-properties"),
            {
              loose: true
            }
          ],
          [
            require.resolve("@babel/plugin-proposal-private-methods"),
            {
              loose: true
            }
          ],
          [
            require.resolve("@babel/plugin-proposal-private-property-in-object"),
            {
              loose: true
            }
          ]
        ],
        cacheDirectory: true,
        cacheCompression: false,
        compact: false
      }
    });
  }
  
  // Configura fallbacks para módulos Node.js no webpack 5
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url/"),
    "path": require.resolve("path-browserify"),
    "process": require.resolve("process/browser")
  };
  
  return config;
};
