const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '',
  },
  experiments: {
    asyncWebAssembly: true
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: false
    }
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/resource'
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    },
    compress: true,
    port: 3001,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '' },
        {
          from: 'node_modules/@ffmpeg/core/dist/umd',
          to: 'ffmpeg'
        }
      ],
    }),
  ],
}; 