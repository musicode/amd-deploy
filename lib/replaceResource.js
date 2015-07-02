/**
 * @file 替换资源地址，用于解决静态资源缓存问题
 * @author musicode
 */

var esprima = require('esprima');

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var moduleIdToFilePath = require('./moduleIdToFilePath');
var resolveModuleId = require('./resolveModuleId');

var traverseFactoryResourceId = require('./traverseFactoryResourceId');
var util = require('./util');


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
            type: Syntax.BlockStatement,
            body: [
                {
                    type: Syntax.ReturnStatement,
                    argument: returnObject
                }
            ]
        },
        generator: false,
        expression: false
    };
}

module.exports = function (fileInfo, config) {

    var replaceRequireConfig = config.replaceRequireConfig;
    if (replaceRequireConfig) {

        var configs = fileInfo.configs;

        configs.forEach(function (item, index) {

            var ast = createFunction('getRequeireConfig', item.arguments[0]);
            var code = util.generateCode(ast);

            eval(code);

            var object = replaceRequireConfig(
                getRequeireConfig()
            );

            configs[index] = esprima.parse(
                  'require.config('
                +     JSON.stringify(object)
                + ');'
            );

        });

    }

    var replaceResource = config.replaceResource;
    if (replaceResource) {

        var amdKeyword = {
            require: 1,
            exports: 1,
            module: 1
        };

        var replace = function (resourceId, baseId) {

            var parts = resourceId.split('!');
            var prefix = '';

            if (parts.length === 2) {
                resourceId = parts[1];
                prefix = parts[0] + '!';
            }

            var origin = resourceId;

            if (baseId) {
                resourceId = resolveModuleId(resourceId, baseId);
            }

            return prefix + replaceResource(
                origin,
                moduleIdToFilePath(resourceId, config)
            );

        }

        fileInfo.modules.forEach(function (item) {

            item.id = replace(item.id);

            [item.dependencies, item.realDependencies].forEach(
                function (dependencies) {
                    dependencies.forEach(
                        function (dependency, index) {
                            if (!amdKeyword[dependency]) {
                                dependencies[index] =
                                replace(dependency, item.id);
                            }
                        }
                    );
                }
            );

            var factory = item.factory;
            if (factory.type === Syntax.FunctionExpression) {
                traverseFactoryResourceId(
                    factory,
                    function (node) {
                        node.value = replace(node.value, item.id);
                        node.raw = "'" + node.value + "'";
                    }
                );
            }

        });
    }

};