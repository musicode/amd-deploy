/**
 * @file 格式化资源
 * @author musicode
 */

var util = require('./util');

function Resource(node) {

    if (typeof node === 'string') {
        node = util.createStringLiteralNode(node);
    }

    var id = node.value;

    var parts = id.split('!');
    var hasPlugin = parts.length === 2;
    var pluginName;

    if (hasPlugin) {
        pluginName = parts[0];
        id = parts[1];
    }

    var setNodeValue = function (value) {

        value = hasPlugin
              ? (pluginName + '!' + value)
              : value;

        node.value = value;
        node.raw = '"' + value + '"';

    };

    Object.defineProperty(this, 'plugin', {
        get: function () {
            return pluginName || '';
        }
    });

    Object.defineProperty(this, 'id', {
        get: function () {
            return id;
        },
        set: function (value) {
            id = value;
            setNodeValue(value);
        }
    });

    Object.defineProperty(this, 'node', {
        get: function () {
            return node;
        }
    });

}

/**
 * @param {string} id 资源 id
 * @return {Object}
 */
module.exports = function (id) {

    return new Resource(id);

};