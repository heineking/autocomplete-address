import path from 'path';
import webpack, { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

// tslint:disable-next-line: no-var-requires
const VueLoaderPlugin: any = require('vue-loader/lib/plugin');

const configuration: Configuration = {
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  entry: {
    ui: './src/ui/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, './src/index.html'),
        to: 'index.html',
      },
    ]),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};

export default configuration;
