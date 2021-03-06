
var path = require('path');

var parseFile = require('./lib/parseFile');

var resourceIdToFilePath = require('./lib/resourceIdToFilePath');
var replaceResources = require('./lib/replaceResources');
var generateFileCode = require('./lib/generateFileCode');
var getFileDependencyCount = require('./lib/getFileDependencyCount');

var util = require('./lib/util');

var combineCache = { };

/**
 *
 * @param options
 * @property {string} options.file 文件路径
 * @property {string=} options.content 如果没传，会去读取 options.file 对应的文件内容
 * @property {Object} options.config
 * @property {Function?} options.prepare 预处理文件内容，比如把 ES6 转成 ES5
 * @property {Function} options.callback
 */
module.exports = function (options) {

    var config = options.config;
    var callback = options.callback;
    var prepare = options.prepare;

    var done = function () {

        var files = combineCache[options.file];

        // 按依赖从少到多排序
        files.sort(
            function (fileInfo1, fileInfo2) {
                return getFileDependencyCount(fileInfo1, combineCache, config)
                    - getFileDependencyCount(fileInfo2, combineCache, config);
            }
        );

        // 替换依赖引用路径
        files.forEach(
            function (fileInfo) {
                replaceResources(fileInfo, config);
            }
        );

        callback(
            generateFileCode(files, config.minify),
            options
        );

    };

    if (combineCache[options.file]) {
        done();
        return;
    }


    var counter = 0;

    var combine = [ ];
    var combineMap = { };

    var addCombine = function (data) {
        if (!combineMap[data.path]) {
            combineMap[data.path] = 1;
            combine.push(data);
            return true;
        }
        return false;
    };

    var processFileComplete = function () {

        counter--;

        if (counter === 0) {
            combineCache[options.file] = combine;
            done();
        }

    };


    var fileReader = config.fileReader || { };

    var processFile = function (file, content) {

        counter++;

        var processContent = function (content) {

            if (prepare) {
                content = prepare(file, content);
            }

            var fileInfo = parseFile(file, content, config);

            if (addCombine(fileInfo)) {

                fileInfo.modules.forEach(function (module) {

                    module.combine.forEach(function (resourceId) {

                        var filePath = resourceIdToFilePath(resourceId, config);
                        if (filePath) {
                            processFile(filePath);
                        }

                    });

                });

            }

            processFileComplete(file);

        };

        if (content) {
            processContent(content);
        }
        else {

            var extname = path.extname(file).toLowerCase();

            var readFile = fileReader[ extname.substr(1) ];
            if (!readFile) {
                readFile = util.readFile;
            }

            content = readFile(file);

            if (content) {
                if (typeof content.then === 'function') {
                    return content.then(function (content) {
                        processContent(content);
                    });
                }
                else if (typeof content === 'string') {
                    return processContent(content);
                }
            }

            processFileComplete(file);

        }

    };

    processFile(options.file, options.content);

};

