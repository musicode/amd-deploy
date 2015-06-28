
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
        }
    };

    var output = function () {

        var code = [ ];
        var replace = config.replace;

        combine.forEach(function (fileInfo) {

            if (replace) {
                replaceResource(fileInfo, config, replace);
            }

            code.push(
                generateFileCode(fileInfo)
            );

        });

        callback(code.join('\n'));

    };

    var process = function (path, code) {

        counter++;

        var processCode = function (code) {

            var fileInfo = parseFile(path, code, config);

            addCombine(fileInfo);

            fileInfo.combine.forEach(function (moduleId) {
                if (!util.hasPlugin(moduleId)) {
                    process(
                        moduleIdToFilePath(moduleId, config)
                    );
                }
            });

            counter--;

            if (counter === 0) {
                output();
            }

        };

        if (code) {
            processCode(code);
        }
        else {
            util.readFile(path, function (code) {
                processCode(code);
            });
        }

    };

    process(options.path, options.code);

};

module.exports({
    path: '/Users/zhujl/github/www-fe/src/pay/course.js',
    callback: function (code) {
        console.log(code);
    },
    config: {
        baseUrl: '/Users/zhujl/github/www-fe/src',
        paths: {
            cobble: '../dep/cobble/0.3.19/src/',
            ab: './common'
        },
        combine: {
            'ab/service': 1,
            'pay/course': 1
        },
        replace: function (requireId, resourcePath) {
            return requireId;
        },
        packages: [
            {
                "name": "cobble",
                "location": "../dep/cobble/0.3.19/src/",
                "main": "main"
            },
            {
                "name": "moment",
                "location": "../dep/moment/2.7.0/src",
                "main": "moment"
            },
            {
                "name": "imageCrop",
                "location": "../dep/imageCrop/0.0.1/src",
                "main": "imageCrop"
            },
            {
                "name": "underscore",
                "location": "../dep/underscore/1.6.0/src",
                "main": "underscore"
            },
            {
                "name": "audioPlayer",
                "location": "../dep/audioPlayer/0.0.1/src",
                "main": "audioPlayer"
            },
            {
                "name": "TextClipboard",
                "location": "../dep/TextClipboard/0.0.2/src",
                "main": "TextClipboard"
            }
        ]
    }
});

