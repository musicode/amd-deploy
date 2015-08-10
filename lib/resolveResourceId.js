/**
 * @file 把 relative id 变为 top-level id
 * @author musicode
 */

var path = require('path');

var resourceIdToFilePath = require('./resourceIdToFilePath');
var filePathToResourceId = require('./filePathToResourceId');

/**
 * @param {string} moduleId 要转换的模块 ID
 * @param {string} baseId 当前模块的 ID
 * @param {Object} config 配置信息
 * @return {string}
 */
module.exports = function (moduleId, baseId, config) {

    if (/^\.{1,2}/.test(moduleId)) {

        var basePath = resourceIdToFilePath(baseId, config);

        var modulePath = path.join(
            path.dirname(basePath),
            moduleId
        );

        return filePathToResourceId(modulePath, config)[0];

    }

    return moduleId;

};
