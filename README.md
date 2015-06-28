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
    combine: {
        moduleId: {
            include: [ ],
            exclucde: [ ]
        }
    }
}
```