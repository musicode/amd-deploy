/**
 * @file 遍历 factory 函数体中的资源 ID
 * @author musicode
 */

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var formatResource = require('./formatResource');
var util = require('./util');

/**
 * @param {Object} ast factory 函数的抽象语法树
 * @return {Object}
 */
module.exports = function (ast) {

    // 同步加载
    var syncResources = [ ];

    // 异步加载
    var asyncResources = [ ];

    if (ast.type === Syntax.FunctionExpression) {
        estraverse.traverse(
            ast,
            {
                enter: function (node) {

                    // 必须是函数节点
                    if (node.type !== Syntax.CallExpression
                        && node.type !== Syntax.NewExpression
                    ) {
                        return;
                    }

                    // 必须是 require 函数
                    if (node.callee.name !== 'require') {
                        return;
                    }

                    node = node.arguments[0];

                    if (util.isStringLiteralNode(node)) {
                        syncResources.push(
                            formatResource(node)
                        );
                    }
                    else if (node.type === Syntax.ArrayExpression) {
                        node.elements.forEach(function (node) {
                            asyncResources.push(
                                formatResource(node)
                            );
                        });
                    }

                }
            }
        );
    }

    return {
        sync: syncResources,
        async: asyncResources
    };

};
