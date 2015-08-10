/**
 * @file 模块合并
 * @author musicode
 */

var minimatch = require('minimatch');

var resolveResourceId = require('./resolveResourceId');
var util = require('./util');

/**
 * 模块合并
 *
 * @param {Object} moduleInfo 模块信息
 * @param {Array.<string>} include 即使不是模块的依赖，也可以强行加进来的依赖
 * @param {Array.<string>} exclude 从模块依赖排除的依赖
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

    moduleInfo.dependencies.forEach(
        function (dependency) {

            if (util.keywords[dependency.id]
                || dependency.plugin
            ) {
                return;
            }

            addDependency(
                resolveResourceId(dependency.id, moduleInfo.id)
            );

        }
    );

    if (include) {
        include.forEach(addDependency);
    }

    if (exclude) {
        exclude.forEach(function (pattern) {
            var index = dependenciesMap[pattern];
            if (index >= 0) {
                // 精确匹配
                dependencies[index] = null;
            }
            else {
                // 模糊匹配
                dependencies.forEach(function (dependency, index) {
                    if (dependency && minimatch(dependency, pattern, { matchBase: true })) {
                        dependencies[index] = null;
                    }
                });
            }
        });
    }

    return dependencies.filter(function (dependency) {
        return dependency != null;
    });

};