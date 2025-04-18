const path = require('path');

module.exports = {
  entry: './dist/index.js',
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
    }
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',  
    globalObject: 'this'   
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  }
};
