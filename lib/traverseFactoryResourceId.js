/**
 * @file 遍历 factory 函数体中的资源 ID
 * @author musicode
 */

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var util = require('./util');

/**
 * @param {Object} ast factory 函数的抽象语法树
 * @param {Function} callback
 */
module.exports = function (ast, callback) {

    var targetMap = { };

    targetMap[Syntax.CallExpression] =
    targetMap[Syntax.NewExpression] = 1;

    estraverse.traverse(
        ast,
        {
            enter: function (node) {

                if (!targetMap[node.type]
                    || node.callee.name !== 'require'
                ) {
                    return;
                }

                node = node.arguments[0];

                if (util.isStringLiteralNode(node)) {
                    callback(node);
                }

            }
        }
    );

};
