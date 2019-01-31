'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path'),
  assets = path.resolve(__dirname, 'assets');

module.exports = (env, argv) => ({
  entry: {
    main: path.resolve(__dirname, 'index.js')
  },
  devtool: 'cheap-module-eval-source-map',
  optimization: {
    usedExports: true
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: { presets: ['@babel/preset-env'] }
      }]
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: { interpolate: true }
      }]
    }, {
      test: /\.s?css$/,
      use: [
        { loader: MiniCssExtractPlugin.loader },
        { loader: 'css-loader' },
        { loader: 'sass-loader', options: { outputStyle: 'compressed' } },
        { loader: '@epegzz/sass-vars-loader', options: { syntax: 'scss', files: [path.resolve(__dirname, 'styles/variables.js')] } }
      ]
    }, {
      test: /\.(png|svg|jpe?g|gif|ico|webp)$/,
      use: [
        { loader: 'url-loader' },
        { loader: 'image-webpack-loader' }
      ]
    }]
  },
  plugins: [].concat(
    (argv.mode === 'production' ? new CleanWebpackPlugin('dist') : []),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      chunks: ['main'],
      chunksSortMode: 'manual'
    }),
    (argv.mode === 'production' ? new FaviconsWebpackPlugin({
      logo: path.resolve(assets, 'orca-splash.min.svg'),
      prefix: 'favicons/',
      persistentCache: true,
      inject: true,
      background: '#fff',
      title: 'Orca — la sécurité au travail'
    }) : [])
  )
});
