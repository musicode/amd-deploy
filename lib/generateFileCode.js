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

    fileInfo.forEach(function (item) {

        item.configs.forEach(function (item) {
            addExpression(item);
        });

        item.modules.forEach(function (item) {
            addExpression(generateModuleAst(item));
        });

    });

    return util.generateCode(body);

};