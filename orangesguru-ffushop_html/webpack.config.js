const webpack = require('webpack'),
      path = require('path');

const production = ( process.env.NODE_ENV == 'production' ? true : false );

const prodPlugins = ( production ? [ new webpack.optimize.UglifyJsPlugin ] : [] );

module.exports = {
    watch: ! production,
    entry: {
        vendors: './src/js/vendors.js',
        main: './src/js/main.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './dist/js'),
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            }
        ]
    },
    plugins: prodPlugins,
}