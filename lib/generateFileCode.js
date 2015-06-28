/**
 * @file 根据文件信息生成代码
 * @author musicode
 */

var estraverse = require('estraverse');
var Syntax = require('estraverse').Syntax;

var getModuleDependencies = require('./getModuleDependencies');
var util = require('./util');

/**
 * 根据模块信息生成 ast
 *
 * @param {Object} moduleInfo parseModule 的返回结果
 * @return {Object}
 */
function generateModuleAst(moduleInfo) {

    var dependencies = getModuleDependencies(moduleInfo).map(
        function (dependency) {
            return {
                type: Syntax.Literal,
                value: dependency,
                raw: "'" + dependency + "'"
            };
        }
    );

    var defineArgs = [ moduleInfo.factory ];

    if (dependencies.length > 0) {
        defineArgs.unshift({
            type: Syntax.ArrayExpression,
            elements: dependencies
        });
    }

    if (moduleInfo.id) {
        defineArgs.unshift({
            type: Syntax.Literal,
            value: moduleInfo.id,
            raw: "'" + module.id + "'"
        });
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
module.exports = exports = function (fileInfo) {

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