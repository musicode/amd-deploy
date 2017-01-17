
var resolveResourceId = require('./resolveResourceId');
var resourceIdToFilePath = require('./resourceIdToFilePath');

var util = require('./util');

var cache = { };

function getFileDependencies(fileInfo, allFileInfo, config) {

    if (cache[fileInfo.path]) {
        return cache[fileInfo.path];
    }

    var result = [ ];
    fileInfo.modules.forEach(
        function (module) {
            module.dependencies.forEach(
                function (dependency) {
                    if (!util.keywords[dependency.id]) {
                        var dependencyId = resolveResourceId(dependency.id, module.id);
                        result.push(dependencyId);

                        var dependencyPath = resourceIdToFilePath(dependencyId, config);
                        if (allFileInfo[dependencyPath]) {
                            allFileInfo[dependencyPath].forEach(
                                function (fileInfo) {
                                    getFileDependencies(fileInfo, allFileInfo, config).forEach(
                                        function (dependency) {
                                            result.push(dependency);
                                        }
                                    );
                                }
                            );
                        }
                    }
                }
            );
        }
    );


    return cache[fileInfo.path] = result;

}

module.exports = getFileDependencies