var escodegen = require('escodegen');
var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var fs = require('fs');

var fileCache = { };

/**
 * 读取文件
 *
 * @param {string} path
 * @param {Function} callback
 */
exports.readFile = function (path, callback) {
    if (fileCache[path]) {
        callback(fileCache[path]);
    }
    else {
        fs.readFile(path, 'utf-8', function (error, content) {

            if (error) {
                console.error(error);
                return;
            }

            fileCache[path] = content;
            callback(content);

        });
    }
};

/**
 * 是否是字符串节点
 *
 * @param {Object}  node
 * @return {boolean}
 */
exports.isStringLiteralNode = function (node) {
    return node
        && node.type === Syntax.Literal
        && typeof node.value === 'string';
};

/**
 * 生成代码
 *
 * @param {Object} ast
 * @return {string}
 */
exports.generateCode = function (ast) {

    if (!Array.isArray(ast)) {
        ast = [ast];
    }

    var ast = {
        type: Syntax.Program,
        body: ast
    };

    return escodegen.generate(ast);

};

/**
 * 资源是否通过插件加载
 *
 * @param {string}  resourceId
 * @return {boolean}
 */
exports.hasPlugin = function(resourceId) {
    var parts = resourceId.split('!');
    return parts.length === 2;
};

/**
 * 是否是相对路径
 *
 * @param {string} url 路径
 * @return {boolean}
 */
exports.isRelativePath = function (url) {
    return !/^([a-z]{2,10}:\/)?\//i.test(url);
};

/**
 * 数组去重
 *
 * @param {Array} array
 * @return {Array}
 */
exports.unique = function (array) {

    var result = [ ];
    var exists = { };

    array.forEach(function (item) {
        if (!exists[item]) {
            result.push(item);
            exists[item] = 1;
        }
    });

    return result;

};

/**
 * 把 b 数组合并到 a 数组
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
exports.merge = function (a, b) {
    b.forEach(function (item) {
        a.push(item);
    });
    return a;
};
