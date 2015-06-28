/**
 * @file 模块合并
 * @author musicode
 */

var getModuleDependencies = require('./getModuleDependencies');
var resolveModuleId = require('./resolveModuleId');

/**
 * 模块合并
 *
 * @param {Object} moduleInfo 模块信息
 * @param {string|Array.<string>} include 即使不是模块的依赖，也可以强行加进来的依赖
 * @param {string|Array.<string>} exclude 从模块依赖排除的依赖
 * @return {Array.<string>}
 */
module.exports = function (moduleInfo, include, exclude) {


    var dependencies = [ ];
    var dependenciesMap = { };

    var addDependency = function (dependency) {
        if (dependenciesMap[dependency] == null) {
            dependenciesMap[dependency] = dependencies.push(dependency) - 1;
        }
    };

    getModuleDependencies(moduleInfo, true).forEach(
        function (dependency) {
            addDependency(
                resolveModuleId(dependency, moduleInfo.id)
            );
        }
    );

    if (include) {
        if (typeof include === 'string') {
            include = [include];
        }
        if (Array.isArray(include)) {
            include.forEach(addDependency);
        }
    }

    if (exclude) {
        if (typeof exclude === 'string') {
            exclude = [exclude];
        }
        if (Array.isArray(exclude)) {
            exclude.forEach(function (dependency) {
                var index = dependenciesMap[dependency];
                if (index >= 0) {
                    dependencies[index] = null;
                }
            });
        }
    }

    return dependencies.filter(function (dependency) {
        return dependency != null;
    });

};