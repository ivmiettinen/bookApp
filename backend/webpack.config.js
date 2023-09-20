const path = require('path')
module.exports = {
    entry: './netlify/functions/app.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '',
        filename: 'bundle.js',
    },
    resolve: {
        fallback: {
            'path': require.resolve('path-browserify'),
            http: require.resolve('stream-http'),
            zlib: require.resolve('browserify-zlib'),
            querystring: require.resolve('querystring-es3'),
            crypto: require.resolve('crypto-browserify'),
            fs: false, // or require.resolve("fs") if needed
            stream: require.resolve('stream-browserify'),
            util: require.resolve('util/'),
            url: require.resolve('url/'),

        },

    },
}