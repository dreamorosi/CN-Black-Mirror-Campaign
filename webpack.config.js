const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')

module.exports = {
  entry: './js/master.js',
  output: {
    filename: './js/bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      ]
    },
    {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        publicPath: '../',
        use: [
          {
            loader: 'css-loader',
            options: {
              // url: false,
              minimize: true,
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ],
        // use style-loader in development
        fallback: 'style-loader'
      })
    }, {
      test: /\.html$/,
      exclude: /node_modules/,
      use: {
        loader: 'html-loader?root=./&attrs=source:src img:src'
      }
    }, {
      test: /\.mp4$/,
      use: [{
        loader: 'file-loader?limit=10000&mimetype=video/mp4',
        options: {
          name: './videos/[name].[ext]'
        }
      }]
    },
    {
      test: /\.(gif|png|jpe?g|svg)$/i,
      exclude: /node_modules/,
      use: [{
        loader: 'file-loader',
        options: {
          hash: 'sha512',
          digest: 'hex',
          name: './images/[name].[ext]'
        }
      },
      {
        loader: 'image-webpack-loader',
        query: {
          mozjpeg: {
            progressive: true
          },
          gifsicle: {
            interlaced: false
          },
          optipng: {
            optimizationLevel: 7
          }
        }
      }]
    }, {
      test: /\.(woff|woff2|eot|ttf)$/,
      exclude: /node_modules/,
      use: 'url-loader?limit=1024&name=fonts/[name].[ext]'
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, '/'),
    publicPath: '/build/',
    hot: true,
    host: '0.0.0.0',
    inline: true,
    compress: true,
    port: 3000,
    historyApiFallback: true
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `v${require('./package.json').version}`,
      raw: false,
      entryOnly: true
    }),
    new ExtractTextPlugin({
      filename: './css/[name].css',
      allChunks: true,
      disable: process.env.NODE_ENV === 'development'
    }),
    new WriteFilePlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, './index.html')
      // favicon: path.resolve(__dirname, '../static/favicon.ico')
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}
