const fs = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const babel = require('babel-core');

function isRelative(path) {
    let reg = /^\./;
    return reg.test(path);
}

function isNodeModule(path) {
    let reg = /^[^\/\.]/;
    return reg.test(path);
}

function getNodeModulePath(dirname, moduleId, config) {
    let moduleIdItems = moduleId.split('/');
    let modName = moduleIdItems[0];
    moduleIdItems.unshift();
    let packagePath = path.resolve(dirname, './node_modules', modName, 'package.json');
    while (dirname != config.root && !fs.existsSync(packagePath)) {
        dirname = path.resolve(dirname, '../');
        packagePath = path.resolve(dirname, './node_modules', modName, 'package.json');
    }

    if (fs.existsSync(packagePath)) {
        if (path.extname(moduleId)) {
            return path.resolve(dirname, './node_modules', modName, moduleIdItems.join('/'));
        }

        let moduleDir = tryExtension(path.resolve(dirname, './node_modules', modName, moduleIdItems.join('/')), config);
        if (moduleDir) {
            return moduleDir;
        }

        let packageJSON = require(packagePath);
        if (packageJSON.main) {
            return path.resolve(dirname, './node_modules', modName, packageJSON.main);
        }

        if (packageJSON.browser) {
            return path.resolve(dirname, './node_modules', modName, packageJSON.browser);
        }

        if (packageJSON.files) {
            return path.resolve(dirname, './node_modules', modName, packageJSON.files[0]);
        }

        return path.resolve(dirname, './node_modules', moduleId);
    }
}

function tryExtension(dirname, config) {
    let index = 0;
    let moduleDir = `${dirname}${config.ext[index]}`;
    while (config.ext[index] && !fs.existsSync(moduleDir)) {
        moduleDir = `${dirname}${config.ext[index]}`;
        index++;
    }

    if (!fs.existsSync(moduleDir)) {
        index = 0;
        moduleDir = path.resolve(dirname, `index/${config.ext[index]}`);
        while (config.ext[index] && !fs.existsSync(moduleDir)) {
            moduleDir = path.resolve(dirname, `index/${config.ext[index]}`);;
            index++;
        }
    }

    if (fs.existsSync(moduleDir)) {
        return moduleDir;
    }
}

function searchModule(filePath, config, globalData) {
    globalData = globalData || {
        moduleList: [],
        handledFile: {},
        modulesMap: {}
    };

    globalData.handledFile[filePath] = [filePath];

    let data = fs.readFileSync(filePath);
    data = data.toString();
    let extname = path.extname(filePath);
    if (extname === '.js' || extname === '.jsx') {
        try {
            data = babel.transform(data, {
                comments: false
            }).code;
        } catch (e) {

        }
    }

    let moduleRegular = /require\((\'|\")[\w\.\/-]+(?:\1)\)|import\s+(?:(?:\w+)|(?:\{(?:\s*\r*\n*\w+\s*,*)+\}))?(?:\s+from\s+)?(\'|\")[\w\.\/-]+(?:\2)/g;
    let itemRegular = /require\((\'|\")([\w\.\/-]+)(?:\1)\)|import\s+(?:(?:\w+)|(?:\{(?:\s*\r*\n*\w+\s*,*)+\}))?(?:\s+from\s+)?(\'|\")([\w\.\/-]+)(?:\3)/;
    let matchResult = data.match(moduleRegular);
    if (matchResult) {
        matchResult.forEach(function(item) {
            let itemMatchRes = item.match(itemRegular);
            if (itemMatchRes) {
                let moduleId = itemMatchRes[2] || itemMatchRes[4];
                let theModule = globalData.moduleList.find(function(item) {
                    return item.id == moduleId;
                });
                if (!theModule) {
                    if (config.externals[moduleId]) {
                        // globalData.moduleList.push({
                        //     id: moduleId,
                        //     dir: config.externals[moduleId]
                        // });
                        globalData.modulesMap[moduleId] = config.externals[moduleId]
                        return;
                    }

                    let moduleDir = moduleId;
                    let dirname = path.dirname(filePath);

                    if (isRelative(moduleId)) {
                        moduleDir = path.resolve(dirname, moduleId);
                    }

                    if (isNodeModule(moduleId)) {
                        let moduleIdItems = moduleId.split('/');
                        let modName = moduleIdItems.shift();
                        if (config.alias[modName]) {
                            moduleDir = path.resolve(config.alias[modName], moduleIdItems.join('/'))
                        } else {
                            moduleDir = getNodeModulePath(dirname, moduleId, config);
                        }
                    }

                    if (moduleDir) {
                        let moduleDirParser = path.parse(moduleDir);
                        if (!moduleDirParser.ext) {
                            moduleDir = tryExtension(moduleDir, config);
                        }
                    }

                    if (moduleDir && fs.existsSync(moduleDir)) {
                        globalData.moduleList.push({
                            id: moduleId,
                            dir: moduleDir
                        });
                        globalData.modulesMap[moduleId] = moduleDir;
                        globalData.handledFile[filePath].push(moduleDir);

                        if (!globalData.handledFile[moduleDir]) {
                            searchModule(moduleDir, config, globalData);
                        }
                    } else {
                        util.log(chalk.red(`module ${moduleId} used in ${filePath} is not exist`));
                        process.exit(1);
                    }
                }
            }
        });
    }

    return globalData;
}

const getConfig = require('./config.js');

module.exports = function(config) {
    if (!config.filePath) {
        util.log(chalk.red('need filePath'));
        process.exit(1);
    }

    config = getConfig(config);

    let relayData = searchModule(config.filePath, config);
    if (relayData) {
        relayData.moduleList.unshift({
            id: 'entry_file_module',
            dir: path.resolve(process.cwd(), config.filePath)
        });
        relayData.modulesMap.entry_file_module = path.resolve(process.cwd(), config.filePath);
        return relayData;
    }
}