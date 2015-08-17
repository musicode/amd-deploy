
var parseFile = require('./lib/parseFile');

var resourceIdToFilePath = require('./lib/resourceIdToFilePath');
var replaceResources = require('./lib/replaceResources');
var generateFileCode = require('./lib/generateFileCode');

var util = require('./lib/util');

var combineCache = { };

/**
 *
 * @param options
 * @property {string} options.file 文件路径
 * @property {string=} options.content 如果没传，会去读取 options.file 对应的文件内容
 * @property {boolean=} options.minify 输出是否压缩
 * @property {Object} options.config
 * @property {Function} options.callback
 */
module.exports = function (options) {

    var config = options.config;
    var callback = options.callback;

    var done = function () {

        var files = combineCache[options.file];

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



    var processFile = function (file, content) {

        counter++;

        var processContent = function (content) {

            var fileInfo = parseFile(file, content, config);

            if (addCombine(fileInfo)) {
                fileInfo.combine.forEach(
                    function (moduleId) {

                        var filePath = resourceIdToFilePath(moduleId, config);
                        if (filePath) {
                            processFile(filePath);
                        }

                    }
                );
            }

            counter--;

            if (counter === 0) {
                combineCache[options.file] = combine;
                done();
            }

        };

        if (content) {
            processContent(content);
        }
        else {

            content = util.readFile(file);

            if (typeof content.then === 'function') {
                content.then(function (content) {
                    processContent(content);
                });
            }
            else {
                processContent(content);
            }

        }

    };

    processFile(options.file, options.content);

};

