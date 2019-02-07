'use strict';

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const minify = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  removeCDATASectionsFromCDATA: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeAttributeQuotes: true,
  useShortDoctype: true,
  keepClosingSlash: true,
  minifyJS: true,
  minifyCSS: true,
  removeScriptTypeAttributes: true,
  removeStyleTypeAttributes: true
};

const path = require('path'),
  assets = path.resolve(__dirname, 'assets'),
  src = path.resolve(__dirname, 'src');

module.exports = (env, argv) => ({
  entry: {
    main: path.resolve(__dirname, 'index.js'),
    logo: path.resolve(src, 'orca-logo/orca-logo.js'),
    reveal: path.resolve(src, 'reveal.js')
  },
  devtool: (argv.mode === 'production' ? '' : 'cheap-module-eval-source-map'),
  optimization: {
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'initial',
          test: /animejs/
        }
      }
    }
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
        options: { interpolate: true, minify }
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
        { loader: 'url-loader', options: { limit: 2048, outputPath: 'assets/' } },
        { loader: 'image-webpack-loader' }
      ]
    }]
  },
  plugins: [].concat(
    argv.mode === 'production' ? new CleanWebpackPlugin('dist/**/*') : [],
    new CopyWebpackPlugin([{ from: path.resolve(assets, 'favicons/'), to: 'favicons/' }]),
    argv.analyze ? new BundleAnalyzerPlugin() : [],
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      chunks: ['vendors', 'logo', 'main', 'reveal'],
      chunksSortMode: 'manual',
      minify
    }),
    argv.mode === 'production' ? new ImageminPlugin() : []
  )
});
