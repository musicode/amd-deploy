/**
 * @file 替换资源地址，用于解决静态资源缓存问题
 * @author musicode
 */

var esprima = require('esprima');

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var moduleIdToFilePath = require('./moduleIdToFilePath');
var resolveModuleId = require('./resolveModuleId');

var parseFactoryResources = require('./parseFactoryResources');
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

    var replaceRequireResource = config.replaceRequireResource;
    if (replaceRequireResource) {

        var replace = function (resourceId, baseId) {

            if (util.keywords[resourceId]) {
                return;
            }

            var rawId = resourceId;

            if (baseId) {
                resourceId = resolveModuleId(resourceId, baseId);
            }

            return replaceRequireResource(
                rawId,
                moduleIdToFilePath(resourceId, config)
            );

        }

        fileInfo.modules.forEach(function (module) {

            var moduleId = module.id;

            module.id = replace(moduleId);

            module.dependencies.forEach(
                function (dependency, index) {
                    var id = replace(dependency.id, moduleId);
                    if (id) {
                        dependency.id = id;
                    }
                }
            );

            var resources = parseFactoryResources(module.factory);

            [
                resources.sync,
                resources.async
            ]
            .forEach(function (resources) {

                resources.forEach(function (resource) {
                    var id = replace(resource.id, moduleId);
                    if (id) {
                        resource.id = id;
                    }
                });

            });


        });
    }

};