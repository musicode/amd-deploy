var escodegen = require('escodegen');
var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var fs = require('fs');

var fileCache = { };

/**
 * 读取文件
 *
 * @param {string} path
 * @return {string|Promise}
 */
exports.readFile = function (path) {

    if (!fileCache[path]) {

        fileCache[path] = new Promise(function (resolve, reject) {

            fs.readFile(path, 'utf-8', function (error, content) {

                if (error) {
                    console.error('[amd-deploy]' + error);
                    return;
                }

                fileCache[path] = content;

                resolve(content);

            });

        });

    }

    return fileCache[path];

};

/**
 * 是否是字符串节点
 *
 * @param {Object} node
 * @return {boolean}
 */
exports.isStringLiteralNode = function (node) {
    return node
        && node.type === Syntax.Literal
        && typeof node.value === 'string';
};

/**
 * 创建字符串节点
 *
 * @param {string} literal
 * @return {boolean}
 */
exports.createStringLiteralNode = function (literal) {
    return {
        type: Syntax.Literal,
        value: literal,
        raw: '"' + literal + '"'
    };
};

/**
 * 关键字
 *
 * @type {Object}
 */
exports.keywords = {
    require: 1,
    exports: 1,
    module: 1
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
 * 是否是相对路径
 *
 * @param {string} url 路径
 * @return {boolean}
 */
exports.isRelativePath = function (url) {
    // 包含协议或以 / 开头
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
 * 合并 a b 数组成一个新数组
 *
 * @param {Array?} a
 * @param {Array?} b
 * @return {Array}
 */
exports.merge = function (a, b) {

    var result = [ ];

    var addItem = function (item) {
        result.push(item);
    };

    if (a) {
        a.forEach(addItem)
    }

    if (b) {
        b.forEach(addItem);
    }

    return result;

};
