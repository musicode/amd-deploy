/**
 * @file 文件路径转为模块 ID
 * @author musicode
 */

var path = require('path');
var util = require('./util');

/**
 * 文件路径的转换取决与 baseUrl 的配置，如果是绝对路径，返回就是绝对路径
 *
 * @param {string} moduleId 模块 ID
 * @param {Object} config 包含 baseUrl paths 等配置项
 * @return {string} 文件路径
 */
module.exports = function (filePath, config) {

    var baseUrl = config.baseUrl.trim();
    if (baseUrl[baseUrl.length - 1] !== '/') {
        baseUrl += '/';
    }

    filePath = filePath.replace(/\.js$/i, '');

    var modules = [ ];
    var modulesMap = { };

    var addModule = function (moduleId) {
        if (!modulesMap[moduleId]) {
            modules.push(moduleId);
            modulesMap[moduleId] = 1;
        }
    };

    var packages = config.packages || [ ];

    packages.forEach(function (pkg) {

        var name = pkg.name;
        var main = pkg.main || 'main';
        var location = pkg.location;

        if (!util.isRelativePath(location)) {
            return;
        }

        // resolve 之后，location 最后不是 /
        location = path.resolve(baseUrl, location);

        if (filePath.indexOf(location + '/') === 0) {

            // 如果是 package/main
            // 需要加两个 moduleId [ 'package', 'package/main' ]
            if (filePath === location + '/' + main) {
                addModule(name);
            }

            addModule(
                name + filePath.replace(location, '')
            );

        }
    });


    var paths = config.paths || { };
    var pathKeys = Object.keys(paths);

    pathKeys.forEach(function (key) {

        var modulePath = paths[key];

        if (!util.isRelativePath(modulePath)) {
            return;
        }

        modulePath = path.resolve(baseUrl, modulePath);

        // paths 可以配到目录或是文件
        var regex = new RegExp('^' + modulePath + '(?:/|$)');
        if (regex.test(filePath)) {
            addModule(
                filePath.replace(modulePath, key)
            );
        }

    });

    if (filePath.indexOf(baseUrl) === 0) {
        addModule(
            filePath.replace(baseUrl, '')
        );
    }

    return modules;

};