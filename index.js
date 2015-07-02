
var parseFile = require('./lib/parseFile');

var moduleIdToFilePath = require('./lib/moduleIdToFilePath');
var replaceResource = require('./lib/replaceResource');
var generateFileCode = require('./lib/generateFileCode');

var util = require('./lib/util');

/**
 *
 * @param options
 * @property {string} options.path
 * @property {string=} options.code 如果没传，会去读取 path 对应的文件内容
 * @property {Object} options.config
 * @property {Function} options.callback
 */
module.exports = function (options) {

    var config = options.config;
    var callback = options.callback;

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

    var done = function () {

        var code = [ ];

        combine.forEach(function (fileInfo) {

            replaceResource(fileInfo, config);

            code.push(
                generateFileCode(fileInfo)
            );

        });

        callback(code.join('\n'));

    };

    var processFile = function (path, code) {

        counter++;

        var processCode = function (code) {

            var fileInfo = parseFile(path, code, config);

            if (addCombine(fileInfo)) {
                fileInfo.combine.forEach(function (moduleId) {
                    if (!util.hasPlugin(moduleId)) {
                        processFile(
                            moduleIdToFilePath(moduleId, config)
                        );
                    }
                });
            }

            counter--;

            if (counter === 0) {
                done();
            }

        };

        if (code) {
            processCode(code);
        }
        else {

            code = util.readFile(path);

            if (typeof code.then === 'function') {
                code.then(function (code) {
                    processCode(code);
                });
            }
            else {
                processCode(code);
            }

        }

    };

    processFile(options.path, options.code);

};

