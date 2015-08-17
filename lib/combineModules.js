/**
 * @file 模块合并
 * @author musicode
 */

var minimatch = require('minimatch');

var resolveResourceId = require('./resolveResourceId');
var util = require('./util');


//
// combine: {
//    include: [ ],
//    exclude: [ ],
//    modules: {
//        moduleId: {
//           include: [ ],
//           exclude: [ ]
//        }
//    }
// }
//
// exclude 和 modules 的 key 支持模糊匹配，如
//
// {
//     "common/**/*": {
//         exclude: [
//             'cobble/**/*'
//         ]
//     },
//     "common/store": {
//         include: [ ],
//         exclude: [ ]
//     }
// }
//
// include 不支持模糊匹配，因为没有比较对象, exclude 的比较对象是 [ 模块依赖 + include ]
//
// 整个配置，最佳实践是范围从大到小进行控制
//
// 比如 combine.include 和 combine.exclude 是全局配置，modules 可以对它进行覆盖，即
//
// 如果 combine.include 包含了一些模块，module.exclude 可以去掉
// 如果 combine.exclude 排除了一些模块，module.include 可以加上
//
// 因为 modules 是个无序的 Object，因此不能依赖它的先后顺序进行配置覆盖，举个例子：
//
// modulus: {
//     "!common/**/*": {
//         exclude: [
//             'common/**/*'
//         ]
//     }
// }
//
//


/**
 * 模糊匹配
 *
 * @inner
 * @param {string} target
 * @param {string} pattern
 * @return {boolean}
 */
function fuzzyMatch(target, pattern) {
    return minimatch(target, pattern, { matchBase: true });
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

    var mainId = moduleInfo.id;
    var moduleIds = [ mainId ];

    if (Array.isArray(moduleInfo.shadows)) {
        moduleInfo.shadows.forEach(function (module) {
            if (module.id) {
                moduleIds.push(module.id);
            }
        });
    }

    var combineConfig = config.combine || { };
    var combineModulesConfig = combineConfig.modules || { };

    // 默认需要合并
    var needCombine = true;

    // 打包合并策略
    var include = [ ];
    var exclude = [ ];

    // 匹配到的模块配置
    var matchModule = function (config) {

        if (config === false) {
            needCombine = false;
            return false;
        }

        if (config) {
            if (config.include) {
                include = util.merge(
                    include,
                    item.include
                );
            }
            if (config.exclude) {
                exclude = util.merge(
                    exclude,
                    item.exclude
                );
            }
            return true;
        }

    };

    moduleIds.forEach(function (moduleId) {

        // 精确匹配
        if (needCombine) {
            matchModule(combineModulesConfig[ moduleId ]);
        }

        // 模糊匹配
        if (needCombine) {

            util.each(
                combineModulesConfig,
                function (item, key) {
                    if (needCombine && fuzzyMatch(moduleId, key)) {
                        matchModule(item);
                    }
                }
            );
        }

    });

    if (!needCombine) {
        return dependencies;
    }

    include = util.merge(
        util.filter(combineConfig.include, exclude),
        include
    );

    exclude = util.merge(
        util.filter(combineConfig.exclude, include),
        exclude
    );


    // 模块自身的依赖
    moduleInfo.dependencies.forEach(
        function (dependency) {

            if (util.keywords[ dependency.id ]
                || dependency.plugin
            ) {
                return;
            }

            addDependency(
                resolveResourceId(dependency.id, mainId)
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
            dependencies.forEach(
                function (dependency, index) {
                    if (dependency && fuzzyMatch(dependency, pattern)) {
                        dependencies[ index ] = null;
                    }
                }
            );

        }

    });

    return dependencies.filter(
        function (dependency) {
            return dependency != null;
        }
    );

};