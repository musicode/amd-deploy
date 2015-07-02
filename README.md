# amd-deploy

## 功能

* 支持打包合并
* 支持资源替换，便于缓存控制

## 配置

```
{
    baseUrl: '',
    paths: { },
    packages: [ ],
    replaceResourceId: function (id, absolutePath) {
        return id;
    },
    replaceRequireConfig: function (config) {
        if (config.baseUrl) {
            config.baseUrl = config.baseUrl.replace('url', 'asset');
        }
        return config;
    },
    combine: {
        include: [
            'json2'
        ],
        exclude: [
            'cobble',
            'cobble/**/*'
        ],
        modules: {
            moduleId: {
                include: [ ],
                exclucde: [ ]
            }
        }
    }
}
```