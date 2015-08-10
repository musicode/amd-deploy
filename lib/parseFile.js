/**
 * @file 解析模块文件
 * @author musicode
 */

var fs = require('fs');

var esprima = require('esprima');

var parseModule = require('./parseModule');
var parseRequireConfig = require('./parseRequireConfig');
var filePathToResourceId = require('./filePathToResourceId');
var combineModules = require('./combineModules');

var util = require('./util');

var fileCache = { };


function createShadowModule(id, dependency) {
    return 'define("' + id + '", ["' + dependency + '"], function (e) { return e; });'
}

/**
 * 解析模块文件
 *
 * @param {string} path 文件路径
 * @param {string} code 文件代码
 * @param {Object} config 模块配置
 */
module.exports = function (path, code, config) {

    if (!fileCache[path]) {

        var ast = esprima.parse(code);
        var modules = parseModule(ast);

        var combine = [ ];

        var shadowModules = [ ];

        modules.forEach(function (module) {

            if (!module.id) {

                // 类似 cobble/main, cobble 表示同一个模块
                // 那么可以在 cobble/main 进行完整定义
                // cobble 只是引用一下 cobble/main

                var counter = 0;

                filePathToResourceId(path, config)
                .forEach(function (moduleId) {

                    if (!moduleId) {
                        return;
                    }

                    if (counter === 0) {
                        module.id = moduleId;
                    }
                    else {

                        shadowModules.push(
                            createShadowModule(moduleId, module.id)
                        );

                    }

                    counter++;

                });

            }

            combineModules(module, config)
            .forEach(function (moduleId) {
                combine.push(moduleId);
            });

        });

        if (shadowModules.length > 0) {

            shadowModules = parseModule(
                esprima.parse(shadowModules.join(''))
            );

            modules = util.merge(modules, shadowModules);

        }

        fileCache[path] = {
            path: path,
            configs: parseRequireConfig(ast),
            modules: modules,
            combine: util.unique(combine)
        };

    }

    return fileCache[path];

};
