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

var fileCache = { };

/**
 * 解析模块文件
 *
 * @param {string} path 文件路径
 * @param {Object} config 模块配置
 * @param {Function} callback
 */
module.exports = exports = function (path, config, callback) {

    if (fileCache[path]) {
        callback(fileCache[path]);
    }
    else {
        fs.readFile(path, 'utf-8', function (error, code) {

            if (error) {
                console.error(error);
                return;
            }

            var ast = esprima.parse(code);
            var modules = parseModule(ast);

            var combine = [ ];
            var combineConfig = config.combine || { };

            modules.forEach(function (module) {

                if (!module.id) {
                    var moduleIds = filePathToModuleId(path, config);
                    module.id = moduleIds[0] || '';
                }

                var moduleCombineConfig = combineConfig[module.id] || { };
                combineModules(
                    module,
                    moduleCombineConfig.include,
                    moduleCombineConfig.exclude
                )
                .forEach(function (moduleId) {
                    combine.push(moduleId);
                });

            });

            var data = {
                path: path,
                configs: parseRequireConfig(ast),
                modules: modules,
                combine: combine
            };

            fileCache[path] = data;

            callback(data);

        });
    }

}