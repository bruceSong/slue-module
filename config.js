var path = require('path');
module.exports = function(config) {
    let def = {
        filePath: './test/app.js',
        root: '/',
        externals: {},
        ext: ['.js', '.jsx', '.css', '.less', '.html'],
        defaultFileName: ['index'],
        // 路径配置
        alias: {}
    };
    return Object.assign(def, config);
};