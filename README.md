# amd-deploy

## 功能

* 支持打包合并
* 支持资源替换，便于缓存控制

## 配置

```
{
    // baseUrl 指向的本地硬盘路径
    baseUrl: '',

    // amd paths
    paths: { },

    // amd packages
    packages: [ ]
}
```

## 替换资源

```
{
    // 资源 ID 替换，如 require('underscore')
    // raw 表示代码中写的字面量，即 underscore
    // absolute 表示硬盘中的文件路径，如 project/dep/underscore/1.0.0/src/underscore.js
    replaceRequireResource: function (raw, absolute) {
        return raw + Date.now();
    },

    // 替换 require.config 中的一些值，比如 src 转为 asset
    replaceRequireConfig: function (config) {
        if (config.baseUrl) {
            config.baseUrl = config.baseUrl.replace('url', 'asset');
        }
        return config;
    }
}
```

## 模块合并

```
{
    combine: {
        // 全局要合并的模块
        include: [
            'json2'
        ],
        // 全局不合并的模块
        exclude: [
            'cobble',
            'cobble/**/*'
        ],

        // 模块默认按自己的依赖进行合并（不合并 build 个毛...）
        // 只有配置成 false 才表示不需要合并（给你不合并的权利）
        // 每个模块还可以配置 include 和 exclude，优先级比全局 include exclude 更高，即
        // 如果 combine.include 包含了一些模块，module.exclude 可以去掉
        // 如果 combine.exclude 排除了一些模块，module.include 可以加上

        // exclude 和 moduleId 支持模糊匹配，规则请参考 glob
        modules: {
            moduleId: {
                include: [ ],
                exclude: [ ]
            }
        }
    }
}
```