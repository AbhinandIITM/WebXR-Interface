const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.mjs',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
 module: {
  rules: [
    {
      test: /\.m?js$/,
      exclude: /node_modules/, // (simplify for now — no special exceptions)
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          sourceType: 'unambiguous'
        }
      }
    }
  ]
},

  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  resolve: {
    extensions: ['.js', '.mjs'], // <-- ensure mjs is resolved
    fullySpecified: false // <-- for bare imports like 'three'
  },
  devServer: {
    static: './dist',
    port: 8081,
    server: {
      type: 'https'
    }
  }
};
