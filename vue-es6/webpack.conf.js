var path = require('path');

module.exports = {
    entry: {
        mine:'./src/vue-mine/MVVM.js',
        mine2:'./src/vue-mine2/MVVM.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, './src'),
                exclude: [path.resolve(__dirname,'./node_modules'), path.resolve(__dirname,'./src/js/util.js')],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env','stage-2']
                    }
                }
            }
        ]
    }
}
