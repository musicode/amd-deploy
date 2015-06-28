
var parseFile = require('./lib/parseFile');

var moduleIdToFilePath = require('./lib/moduleIdToFilePath');
var replaceResource = require('./lib/replaceResource');
var generateFileCode = require('./lib/generateFileCode');

var util = require('./lib/util');

module.exports = exports = function (path, config) {

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

        code = code.join('');

        //console.log(code)
    };

    var parse = function (path) {

        counter++;

        parseFile(path, config, function (data) {

            addCombine(data);

            data.combine.forEach(function (moduleId) {
                if (!util.hasPlugin(moduleId)) {
                    parse(
                        moduleIdToFilePath(moduleId, config)
                    );
                }
            });

            counter--;

            if (counter === 0) {
                output();
            }

        });

    };

    parse(path);

};

exports(
    '/Users/zhujl/github/www-fe/src/pay/course.js',
    {
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
);

