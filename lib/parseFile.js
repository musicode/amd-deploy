/**
 * @file 解析模块文件
 * @author musicode
 */

var fs = require('fs');

var esprima = require('esprima');

var parseModule = require('./parseModule');
var parseRequireConfig = require('./parseRequireConfig');
var filePathToModuleId = require('./filePathToModuleId');
var combineModules = require('./combineModules');

var util = require('./util');

var fileCache = { };

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
                var moduleIds = filePathToModuleId(path, config);
                module.id = moduleIds[0] || '';
            }

            var moduleConfig = combineModulesConfig[module.id];

            if (moduleConfig) {
                combineModules(
                    module,
                    util.merge(moduleConfig.include, combineConfig.include),
                    util.merge(moduleConfig.exclude, combineConfig.exclude)
                )
                .forEach(function (moduleId) {
                    combine.push(moduleId);
                });
            }

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
