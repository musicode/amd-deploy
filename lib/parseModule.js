/**
 * @file 分析模块 ID 和依赖
 * @author musicode
 */

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var traverseFactoryResourceId = require('./traverseFactoryResourceId');
var util = require('./util');

/**
 * 分析 define ast node，获取模块信息
 *
 * @inner
 * @param {Object} node
 * @return {Object}
 */
function analyseDefineAst(node) {

    var id = '';

    var factory;

    // 作为 define 参数的依赖
    var dependencies = [ ];

    // 实际用到的依赖
    var realDependencies = [ ];
    var realDependenciesMap = { };

    var addRealDependency = function (dependency) {
        if (!realDependenciesMap[dependency]) {
            realDependenciesMap[dependency] = 1;
            realDependencies.push(dependency);
        }
    };

    node.arguments.forEach(
        function (node, index) {
            if (index === 0 && util.isStringLiteralNode(node)) {
                id = node.value;
            }
            else if (index === 1 && node.type === Syntax.ArrayExpression) {
                node.elements.forEach(
                    function (node) {
                        if (util.isStringLiteralNode(node)) {

                            var dependency = node.value;

                            // define 参数中声明的
                            // 保持原样的存储，不需要去重
                            dependencies.push(dependency);

                            addRealDependency(dependency);

                        }
                    }
                );
            }
            else {
                factory = node;
                return false;
            }
        }
    );

    // 计算工厂函数的形参数量
    var factoryParamCount = 0;

    var hasFactory = factory
                  && factory.type === Syntax.FunctionExpression;

    if (hasFactory) {
        factoryParamCount = factory.params.length;
    }

    if (dependencies.length === 0) {
        dependencies = [ 'require', 'exports', 'module' ].slice(0, factoryParamCount);
    }

    if (hasFactory) {
        traverseFactoryResourceId(
            factory,
            function (node) {
                addRealDependency(node.value);
            }
        );
    }

    return {
        id: id,
        dependencies: dependencies,
        realDependencies: realDependencies,
        factory: factory
    };

}

module.exports = exports = function (ast) {

    var modules = [ ];

    estraverse.traverse(
        ast,
        {
            enter: function (node) {
                if (node.type === Syntax.CallExpression
                    && node.callee.name === 'define'
                ) {

                    // 无需遍历子节点
                    this.skip();

                    modules.push(
                        analyseDefineAst(node)
                    );

                }
            }
        }
    );

    return modules;

};