'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './index.js'
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
        options: { minimize: true }
      }]
    }, {
      test: /\.s?css$/,
      use: [
        { loader: MiniCssExtractPlugin.loader },
        { loader: 'css-loader' }, {
          loader: 'sass-loader',
          options: { outputStyle: 'compressed' }
        }
      ]
    }, {
      test: /\.(png|svg|jpe?g|gif|ico)$/,
      use: [
        { loader: 'url-loader' },
        { loader: 'image-webpack-loader' }
      ]
    }]
  },
  plugins: [
    new CleanWebpackPlugin('dist'),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      chunks: ['main'],
      chunksSortMode: 'manual'
    })
  ]
};
