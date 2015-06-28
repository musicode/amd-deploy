/**
 * @file 替换资源地址，用于解决静态资源缓存问题
 * @author musicode
 */

var estraverse = require('estraverse');
var Syntax = require('estraverse').Syntax;

var moduleIdToFilePath = require('./moduleIdToFilePath');
var resolveModuleId = require('./resolveModuleId');

var traverseFactoryResourceId = require('./traverseFactoryResourceId');
var util = require('./util');

function replaceProperty(getValue, setValue, replaceValue) {

    if (typeof getValue === 'function') {
        getValue = getValue();
    }

    var value = replaceValue(getValue);

    if (value && typeof value === 'string') {
        setValue(value);
    }

}

function createFunction(name, returnObject) {
    return {
        type: Syntax.FunctionDeclaration,
        id: {
            type: Syntax.Identifier,
            name: name
        },
        params: [],
        defaults: [],
        body: {
            type: BlockStatement,
            body: [
                {
                    type: ReturnStatement,
                    argument: returnObject
                }
            ]
        },
        generator: false,
        expression: false
    };
}

module.exports = exports = function (fileInfo, config, replace) {

    var replaceResource = function (resourceId, baseId) {

        var parts = resourceId.split('!');
        var prefix = '';

        if (parts.length === 2) {
            resourceId = parts[1];
            prefix = parts[0] + '!';
        }

        var requireId = resourceId;

        if (baseId) {
            resourceId = resolveModuleId(resourceId, baseId)
        }

        var filePath = moduleIdToFilePath(resourceId, config);

        return prefix + replace(
            requireId,
            filePath
        );

    };

    // 转成 js 对象比较好处理
    fileInfo.configs.forEach(function (item) {

        eval(
            util.generateCode(
                createFunction('getRequireConfig', item.arguments[0])
            )
        );

        var config = getRequireConfig();

        // 暂时不处理 config

    });

    var amdKeyword = {
        require: 1,
        exports: 1,
        module: 1
    };

    fileInfo.modules.forEach(function (item) {

        item.id = replaceResource(item.id);

        [item.dependencies, item.realDependencies].forEach(
            function (dependencies) {
                dependencies.forEach(
                    function (dependency, index) {
                        if (amdKeyword[dependency]) {
                            return;
                        }
                        dependencies[index] = replaceResource(dependency, item.id);
                    }
                );
            }
        );

        var factory = item.factory;
        if (factory.type === Syntax.FunctionExpression) {
            traverseFactoryResourceId(
                factory,
                function (node) {
                    node.value = replaceResource(node.value, item.id);
                    node.raw = "'" + node.value + "'";
                }
            );
        }

    });

};