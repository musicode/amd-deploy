
var resolveResourceId = require('./resolveResourceId');
var resourceIdToFilePath = require('./resourceIdToFilePath');

var util = require('./util');

var cache = { };

function getFileDependencyCount(fileInfo, allFileInfo, config) {

    if (cache[fileInfo.path]) {
        return cache[fileInfo.path];
    }

    var count = 0;
    fileInfo.modules.forEach(
        function (module) {
            module.dependencies.forEach(
                function (dependency) {
                    if (!util.keywords[dependency.id]) {
                        var dependencyId = resolveResourceId(dependency.id, module.id);
                        count++;

                        var dependencyPath = resourceIdToFilePath(dependencyId, config);
                        if (allFileInfo[dependencyPath]) {
                            allFileInfo[dependencyPath].forEach(
                                function (fileInfo) {
                                    count += getFileDependencyCount(fileInfo, allFileInfo, config);
                                }
                            );
                        }
                    }
                }
            );
        }
    );


    return cache[fileInfo.path] = count;

}

module.exports = getFileDependencyCount