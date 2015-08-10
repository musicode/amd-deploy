/**
 * @file 模块合并
 * @author musicode
 */

var minimatch = require('minimatch');

var resolveResourceId = require('./resolveResourceId');
var util = require('./util');


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
        list = [ list ];
    }

    if (typeof exclude === 'string') {
        exclude = [ exclude ];
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
 * 模块合并
 *
 * @param {Object} moduleInfo 模块信息
 * @param {Object} config 配置信息
 * @return {Array.<string>}
 */
module.exports = function (moduleInfo, config) {

    var dependencies = [ ];
    var dependenciesMap = { };

    var addDependency = function (dependency) {
        if (dependenciesMap[dependency] == null) {
            dependenciesMap[dependency] = dependencies.push(dependency) - 1;
        }
    };

    var combineConfig = config.combine || { };
    var combineModulesConfig = combineConfig.modules || { };

    var moduleConfig = combineModulesConfig[moduleInfo.id];

    // 配置成 false 表示不需要模块合并
    if (moduleConfig === false) {
        return dependencies;
    }

    if (moduleConfig == null) {
        moduleConfig = { };
    }

    // moduleConfig 配置优先于 combineConfig

    // 如果 combineConfig.include 包含了一些模块，moduleConfig.exclude 可以去掉
    var include = util.merge(
        filter(combineConfig.include, moduleConfig.exclude),
        moduleConfig.include
    );

    // 如果 combineConfig.exclude 排除了一些模块，moduleConfig.include 可以加上
    var exclude = util.merge(
        filter(combineConfig.exclude, moduleConfig.include),
        moduleConfig.exclude
    );


    // 模块自身的依赖
    moduleInfo.dependencies.forEach(
        function (dependency) {

            if (util.keywords[dependency.id]
                || dependency.plugin
            ) {
                return;
            }

            addDependency(
                resolveResourceId(dependency.id, moduleInfo.id, config)
            );

        }
    );



    include.forEach(addDependency);

    exclude.forEach(function (pattern) {
        var index = dependenciesMap[ pattern ];
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

    return dependencies.filter(function (dependency) {
        return dependency != null;
    });

};