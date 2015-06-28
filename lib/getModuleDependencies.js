/**
 * @file 获取模块的依赖列表，打包时作为 define 函数的 dependencies 参数
 * @author musicode
 */

/**
 * 根据模块信息生成获取依赖列表
 *
 * @param {Object} moduleInfo analyseModule 的返回结果
 * @param {boolean=} filterKeyword 是否过滤 require exports module 三个关键字
 * @return {Array.<string>}
 */
module.exports = function (moduleInfo, filterKeyword) {

    // 拷贝一份，避免内部修改影响外部使用
    var dependencies = moduleInfo.dependencies.slice(0);
    var realDependencies = moduleInfo.realDependencies;

    if (dependencies.length > 0
        || realDependencies.length > 0
    ) {

        var exists = { };

        dependencies.forEach(function (dependency) {
            exists[dependency] = 1;
        });

        realDependencies.forEach(function (dependency) {
            if (!exists[dependency]) {
                exists[dependency] = 1;
                dependencies.push(dependency);
            }
        });

    }

    if (filterKeyword) {

        var amdKeyword = {
            require: 1,
            exports: 1,
            module: 1
        };

        return dependencies.filter(function (dependency) {
            return !amdKeyword[dependency];
        });
    }

    return dependencies;

};