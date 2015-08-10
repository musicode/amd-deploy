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

/**
 * 过滤
 *
 * @inner
 * @param {Array} include
 * @param {Array} exclude
 * @return {Array}
 */
function filter(list, exclude) {

    if (!list || !exclude) {
        return list;
    }

    if (typeof list === 'string') {
        list = [list];
    }

    if (typeof exclude === 'string') {
        exclude = [exclude];
    }

    exclude.forEach(function (item) {
        var index = list.indexOf(item);
        if (index >= 0) {
            list.splice(index);
        }
    });

    return list;

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
        var combineConfig = config.combine || { };
        var combineModulesConfig = combineConfig.modules || { };

        modules.forEach(function (module) {

            if (!module.id) {
                var moduleIds = filePathToResourceId(path, config);
                module.id = moduleIds[0] || '';
            }

            var moduleConfig = combineModulesConfig[module.id];

            // 只有配置成 false 才表示不需要模块合并
            if (moduleConfig === false) {
                return;
            }

            if (moduleConfig == null) {
                moduleConfig = { };
            }

            // moduleConfig 配置优先于 combineConfig

            // 如果 combineConfig.include 包含了一些模块，moduleConfig.exclude 可以去掉
            // 即全局要 include 的模块
            var include = filter(combineConfig.include, moduleConfig.exclude);

            // 如果 combineConfig.exclude 排除了一些模块，moduleConfig.include 可以加上
            // 即全局要 exclude 的模块
            var exclude = filter(combineConfig.exclude, moduleConfig.include);

            combineModules(
                module,
                util.merge(moduleConfig.include, include),
                util.merge(moduleConfig.exclude, exclude)
            )
            .forEach(function (moduleId) {
                combine.push(moduleId);
            });

        });

        fileCache[path] = {
            path: path,
            configs: parseRequireConfig(ast),
            modules: modules,
            combine: util.unique(combine)
        };

    }

    return fileCache[path];

};
