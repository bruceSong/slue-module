# slue-module

在web构建工程中，给定一个文件，分析其依赖关系。

## slue-conf.js打包配置清单
```javascript
    const slueModule = require('slue-module');
    let realyData = slueModule(options);
```

## options选项如下：
```javascript
{
    // 要分析的文件路径
    filePath: './test/app.js',

    // 全局变量映射
    externals: {
        'react': 'React'
    },

    // 支持的文件后缀名补齐列表及顺顺序，下面为默认配置
    ext: ['.js', '.jsx', '.css', '.less', '.html'],

    // 路径简化配置
    alias: {
        components: path.join(__dirname, './components')
    }
};
```

## realyData示例如下：
```javascript
{
    // 模块引用及其文件路径的列表，externals配置项会被排除在外
    moduleList: [
        {
            id: 'xxx', // 模块引用id
            dir: 'xxx' // 模块真实路径
        }
    ],

    // 完整的模块id到模块路径的映射
    externals: {
        'react': 'React'
    }

    // 扫描过的说用文件
    handledFile: {}
};
```