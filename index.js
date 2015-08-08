
var parseFile = require('./lib/parseFile');

var moduleIdToFilePath = require('./lib/moduleIdToFilePath');
var replaceResource = require('./lib/replaceResource');
var generateFileCode = require('./lib/generateFileCode');

var util = require('./lib/util');

var combineCache = { };

/**
 *
 * @param options
 * @property {string} options.file 文件路径
 * @property {string=} options.content 如果没传，会去读取 options.file 对应的文件内容
 * @property {Object} options.config
 * @property {Function} options.callback
 */
module.exports = function (options) {

    var config = options.config;
    var callback = options.callback;

    var done = function () {

        var code = [ ];

        combineCache[options.file].forEach(
            function (fileInfo) {

                replaceResource(fileInfo, config);

                code.push(
                    generateFileCode(fileInfo)
                );

            }
        );

        callback(code.join('\n'));

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
                        processFile(
                            moduleIdToFilePath(moduleId, config)
                        );
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

