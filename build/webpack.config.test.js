const nodeExternals = require('webpack-node-externals');
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [
            // ...
            { test: /\.scss$/, loader: 'null-loader' },
            { test: /\.css$/, loader: 'null-loader' },
            { test: /\.styl$/, loaders: 'null-loader' },
            { test: /\.vue$/, loader: 'vue-loader' },
            // ...
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};