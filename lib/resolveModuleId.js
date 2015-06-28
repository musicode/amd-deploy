/**
 * @file 把 relative id 变为 top-level id
 * @author musicode
 */

/**
 * @param {string} moduleId 要转换的模块 ID
 * @param {string} baseId 当前模块的 ID
 * @return {string}
 */
module.exports = exports = function (moduleId, baseId) {

    if (/^\.{1,2}/.test(moduleId)) {

        // moduleId './b'
        // baseId 'common/a'

        var moduleTerms = moduleId.split('/');
        var baseTerms = baseId.split('/');

        var moduleCount = moduleTerms.length;
        // 到目录这级就行
        var baseCount = baseTerms.length - 1;

        var moduleIndex = 0;
        var baseIndex = 0;

        moduleTerms.forEach(function (term) {

            if (term === '..') {
                if (baseIndex < baseCount) {
                    moduleIndex++;
                    baseIndex++;
                }
                else {
                    return false;
                }
            }
            else if (term === '.') {
                moduleIndex++;
            }
            else {
                return false;
            }

        });

        baseTerms.length = baseCount - baseIndex;
        moduleTerms = moduleTerms.slice(moduleIndex);

        return baseTerms.concat(moduleTerms).join('/');

    }

    return moduleId;

};
