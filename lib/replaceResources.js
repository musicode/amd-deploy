/**
 * @file 替换资源地址，用于解决静态资源缓存问题
 * @author musicode
 */

var esprima = require('esprima');

var estraverse = require('estraverse');
var Syntax = estraverse.Syntax;

var resourceIdToFilePath = require('./resourceIdToFilePath');
var resolveResourceId = require('./resolveResourceId');

var parseRequireConfig = require('./parseRequireConfig');
var parseFactoryResources = require('./parseFactoryResources');
var util = require('./util');


module.exports = function (fileInfo, config) {

    var replaceRequireConfig = config.replaceRequireConfig;
    if (replaceRequireConfig) {

        var configs = fileInfo.configs;

        configs.forEach(function (item, index) {

            var code;
            var object;

            try {
                code = util.generateCode(item.arguments[0]);
                object = eval( '(' + code + ')' );
            }
            catch (e) {
                console.log('[amd-deploy][parse require config fail]');
                console.log(fileInfo.path);
            }

            if (object) {

                var ast = esprima.parse(
                      'require.config('
                    +     JSON.stringify(replaceRequireConfig(object))
                    + ');'
                );

                configs[index] = parseRequireConfig(ast)[0];

            }

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
                resourceId = resolveResourceId(resourceId, baseId, config);
            }

            return replaceRequireResource(
                rawId,
                resourceIdToFilePath(resourceId, config)
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