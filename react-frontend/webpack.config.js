import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CSSMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const { version } = JSON.parse(fs.readFileSync(path.join(dirname, '../package.json')));
const versionSuffix = process.env.BBCAT_ORCHESTRATION_BUILDER_VERSION_SUFFIX;

export default (env, { mode = 'development' }) => ({
  devtool: 'source-map',
  target: 'web',
  entry: './src/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(dirname, 'dist'),
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
              search: '@import url\\(.*fonts\\.googleapis\\.com.*\\);',
              replace: '',
              flags: 'g',
            },
          },
        ],
      },
      {
        test: [/\.jsx?$/],
        exclude: [/node_modules/],
        loader: 'babel-loader',
        options: {
          plugins: [mode === 'development' && 'react-refresh/babel'].filter(Boolean),
        },
      },
    ],
  },
  resolve: {
    symlinks: false,
    extensions: ['.js', '.jsx'],
    fullySpecified: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(`${version}-${mode}${versionSuffix ? `-${versionSuffix}` : ''}`),
      DEVELOPMENT: (mode === 'development'),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(dirname, 'src/index.html'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    mode === 'development' && new ReactRefreshWebpackPlugin({
      esModule: true,
    }),
  ].filter(Boolean),
  optimization: {
    minimizer: [
      new CSSMinimizerWebpackPlugin({}),
    ],
  },
});
