'use strict';

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

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
  assets = path.resolve(__dirname, 'assets');

module.exports = (env, argv) => ({
  entry: {
    main: path.resolve(__dirname, 'index.js')
  },
  devtool: (argv.mode === 'production' ? '' : 'cheap-module-eval-source-map'),
  optimization: {
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'commons',
          chunks: 'initial',
          test: /animejs|[\/\\]src[\/\\]utils/
        }
      }
    }
  },
  module: {
    rules: [{
      test: /\.ttf$/,
      use: [
        { loader: 'file-loader' }
      ]
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }]
          ],
          plugins: ['@babel/plugin-syntax-dynamic-import']
        }
      }]
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: { attrs: ['img:src', 'img:data-src', 'video:src', 'video:data-src'], interpolate: true, root: __dirname, minimize: argv.mode === 'production', ...minify }
      }]
    }, {
      test: /\.s?css$/,
      enforce: 'pre',
      use: [
        { loader: 'css-loader' }
      ]
    }, {
      test: /\.scss$/,
      enforce: 'pre',
      use: [
        { loader: 'sass-loader', options: { outputStyle: 'compressed' } },
        { loader: 'sass-resources-loader', options: { resources: './styles/commons.scss' } }
      ]
    }, {
      test: /\.s?css$/,
      use: [
        { loader: MiniCssExtractPlugin.loader },
      ]
    }, {
      test: /\.(png|jpe?g|gif|ico|webp|mp4)$/,
      use: [
        { loader: 'url-loader', options: { limit: 2048, outputPath: 'assets/' } }
      ]
    }, {
      test: /\.svg$/,
      issuer: /\.(html|js)$/,
      use: [
        { loader: 'file-loader', options: { outputPath: 'assets/' } }
      ]
    }, {
      test: /\.svg$/,
      issuer: /\.s?css$/,
      use: [
        { loader: 'svg-url-loader' }
      ]
    }, {
      test: /\.(png|jpe?g|gif|ico|svg|webp|mp4)$/,
      enforce: 'pre',
      use: [
        { loader: 'image-webpack-loader' }
      ]
    }]
  },
  plugins: [].concat(
    argv.mode === 'production' ? new CleanWebpackPlugin() : [],
    new CopyWebpackPlugin([{ from: path.resolve(assets, 'favicons/'), to: 'favicons/' }]),
    argv.analyze ? new BundleAnalyzerPlugin() : [],
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      chunks: ['commons', 'main', 'logo'],
      chunksSortMode: 'manual',
      minify
    }),
    new ScriptExtHtmlWebpackPlugin({ defaultAttribute: 'defer' }),
    argv.mode === 'production' ? new ImageminPlugin() : []
  )
});
