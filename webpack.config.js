const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true
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
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
        generator: {
          filename: 'video/ffmpeg/[name][ext]'
        }
      },
      {
        test: /\.worker\.(js|ts)$/,
        use: { 
          loader: 'worker-loader',
          options: { 
            inline: 'no-fallback',
            filename: 'video/ffmpeg/[name].js'
          }
        }
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
    historyApiFallback: true
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '' },
        { 
          from: path.resolve(__dirname, 'src/common/styles.css'),
          to: 'common/styles.css'
        },
        { 
          from: path.resolve(__dirname, 'node_modules/@ffmpeg/core/dist/umd'),
          to: 'video/ffmpeg',
          globOptions: {
            ignore: ['**/*.map']
          }
        }
      ],
    }),
  ],
}; 