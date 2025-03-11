const path = require('path');

module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
      "fs": path.resolve(__dirname, './empty.ts'),
      "os": path.resolve(__dirname, './empty.ts'),
      "path": path.resolve(__dirname, './empty.ts'),
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
