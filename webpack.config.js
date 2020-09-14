'use strict';

/**
* Plugins
*/
const path = require('path')
const glob = require('glob-all')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const PATHS = {
  build: '/dist/',
  src: path.join(__dirname, 'src')
}

module.exports = {
  context: PATHS.src,
  entry: {
    app: ['./js/app.js'],
  },
  output: {
    publicPath: PATHS.build,
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/js/'),
      '@/lib/three': path.resolve(__dirname, 'src/js/lib/three.js'),
      'three$': path.resolve(__dirname, 'src/js/lib/three.js'),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: 'all',
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          }
        ],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            loader: 'glslify-loader'
          }
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { 
            loader: 'css-loader', 
            options: { 
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
          }
        ],
      },
      {
        test: /\.(png|jpg|woff|woff2|eot|ttf|svg|fnt)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000,
              name: '[name].[ext]'
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new PurgecssPlugin({
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      whitelistPatterns: [/^js-|z|gl|t|is-|align-/],
      paths: glob.sync([
        `${PATHS.src}/**/*.njk`,
        `${PATHS.src}/_data/*.js`,
      ], { nodir: true }),
    }),
  ],
}