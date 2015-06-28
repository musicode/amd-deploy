/**
 * @file 解析 require.config 配置
 * @author musicode
 */

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

module.exports = exports = function (ast) {

    var configs = [ ];

    estraverse.traverse(
        ast,
        {
            enter: function (node) {

                var callee = node.callee;

                if (node.type === Syntax.CallExpression
                    && callee.type === Syntax.MemberExpression
                ) {

                    var object = callee.object;
                    var property = callee.property;

                    if (object.type === Syntax.Identifier
                        && object.name === 'require'
                        && property.type === Syntax.Identifier
                        && property.name === 'config'
                    ) {
                        configs.push(node);
                    }

                }
            }
        }
    );

    return configs;

};
