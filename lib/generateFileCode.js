/**
 * @file 根据文件信息生成代码
 * @author musicode
 */

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var util = require('./util');

/**
 * 根据模块信息生成 ast
 *
 * @param {Object} moduleInfo parseModule 的返回结果
 * @return {Object}
 */
function generateModuleAst(moduleInfo) {

    var defineArgs = [ moduleInfo.factory ];

    if (moduleInfo.dependencies.length > 0) {
        defineArgs.unshift({
            type: Syntax.ArrayExpression,
            elements: moduleInfo.dependencies.map(
                function (dependency) {
                    return dependency.node;
                }
            )
        });
    }

    if (moduleInfo.id) {
        defineArgs.unshift(
            util.createStringLiteralNode(moduleInfo.id)
        );
    }

    return {
        type: Syntax.CallExpression,
        callee: {
            type: Syntax.Identifier,
            name: 'define'
        },
        arguments: defineArgs
    };

}

/**
 * 输出模块代码
 *
 * @param {Array|Object} fileInfo parseFile 的返回结果
 * @return {string}
 */
module.exports = function (fileInfo) {

    if (!Array.isArray(fileInfo)) {
        fileInfo = [ fileInfo ];
    }

    var body = [ ];

    var addExpression = function (expression) {
        body.push({
            type: Syntax.ExpressionStatement,
            expression: expression
        });
    };

    // configs 放在最前面

    var configs = [ ];
    var modules = [ ];

    fileInfo.forEach(function (item) {
        configs = util.merge(configs, item.configs);
        modules = util.merge(modules, item.modules);
    });

    configs.forEach(addExpression);

    // 按字母表顺序排序
    modules.sort(function (module1, module2) {
        return module1.id > module2.id ? 1 : -1;
    });

    // 按依赖数量，从少到多排序
    modules.sort(function (module1, module2) {
        return module1.dependencies.length - module2.dependencies.length;
    });

    modules.forEach(function (item) {
        addExpression(generateModuleAst(item));
    });

    return util.generateCode(body);

};