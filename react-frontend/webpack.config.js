const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { version } = require('./package.json');

const versionSuffix = process.env.BBCAT_ORCHESTRATION_BUILDER_VERSION_SUFFIX;

module.exports = (env, { mode = 'development' }) => ({
  devtool: 'source-map',
  entry: [
    path.resolve(__dirname, 'src/index.js'),
  ],
  output: {
    filename: 'bundle.[hash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'string-replace-loader',
            options: {
              search: '@import url\(.*fonts\.googleapis\.com.*\);',
              replace: '',
              flags: 'g',
            },
          },
        ],
      },
      {
        test: /\.(png|eot|ttf|woff|woff2|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 1000,
        },
      },
      {
        test: [/\.jsx?$/],
        exclude: [/node_modules/],
        loader: 'babel-loader',
      },
      {
        test: require.resolve('qrcodejs/qrcode'),
        use: 'exports-loader?QRCode',
      },
    ],
  },
  resolve: {
    symlinks: false,
    extensions: ['.js', '.jsx'],
    alias: {
      Components: path.resolve(__dirname, 'src/Components'),
      Lib: path.resolve(__dirname, 'src/lib'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(`${version}-${mode}${versionSuffix ? `-${versionSuffix}` : ''}`),
      DEVELOPMENT: (mode === 'development'),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: mode === 'development',
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
});
