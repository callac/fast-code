# 交易所 - 开发文档

## bvip_web 相关

使用 vue + vuex + vue-i18n + vue-router + axios + webpack 搭建开发

### 目录
```
-- src
  -- assets                   用于存放图片，语言包等静态资源
  -- components               用于存放组件
  -- css                      用于存放 css 样式文件，本项目 css 与 vue 文件分离
  -- data                     用于存放 api, store
  -- extensions               一些扩展，比如:
                                提供 Http 服务的 HttpPlugin，登录授权逻辑也在里面
                                全局事件处理的 bus
                                用于折合的 CurrencyConversion
                                用于封装处理语言国际化的 i18n
                                封装 websocket 的 socket
                                ...
  -- pages                    页面文件
  -- router                   路由信息
  -- utils                    公用的工具函数
  -- App.vue                  根实例
  -- global-register-default.js       用于全局组件，方法，属性注册
  -- main.js                  webpack 入口文件
```

### 配置文件

配置信息请看文件 `config/config.js.sample`

需要使用 `cp config/config.js.sample config/config.js` 命令生成目标文件 `config/config.js`，
再相应修改配置。

### 分支

主代码分支为 master，其他分支逻辑和 master 一样，但是根据不同的独立部署的站点的需求会有部分的内容不一样

比如：zt.com 对应 zt 和 zt-dev 分支；k-coin.io 对应 k-coin分支；bitaladdin.com 对应 jp 分支

temp-dev 用于 `母版 - 模板 - 主题` 组合开发。开发完 checked 之后合并到 master，然后再是将 master 合并到各个站点分支以应用更新

这样子主要是保证 master 的普适性

以后如果有新的独立部署的站点，可以直接发布 master，如果会有特定的需求，建议和 zt，k-coin，bitaladdin 一样切换出一个新的分支用于开发和发布


### 多母版 - 多模板 - 多主题 实现

> 由于交易所项目性质（联盟站，不同的站点的样式，甚至内容都会不一样），前端代码需要实现 主逻辑代码，内容，和 样式 的分离，
> 因此设计了这个 `多母版 - 多模板 - 多主题` 的方案

`母版`，`模板`，`主题` 定义在文件 `config/themes.js`

一个站点对应一个 `母版 - 模板 - 主题` 的组合。
比如:sipc.vip 对应的是 `sipc - sipc - sipc_1`；zt.com 对应的是 `default - t3 - self_help`

webpack 打包以一个组合为一个单位，有多少个组合就会打包出多少份静态 html， html 之间通过 组合名 区分。
比如：`sipc - sipc - sipc_1` 组合打包得到的是 `index-sipc-sipc_1.html`；`default - t3 - self_help` 组合打包得到的是 `index-t3-self_help.html`；

站点 与 组合的对应关系在后台配置，对应关系的实现则在 `server-index.js` 文件中

#### 母版 - mask

同一个母版的组合，逻辑 与 内容 大体相同

不同母版的组合，逻辑 会大体相同，内容 差别会比较大

#### 模板 - template

一个模板只能对应一个母版。逻辑请看 `config/themes.js` 中的 `checkMasks` 方法

同一个模板的组合，逻辑 与 内容 完全相同，就颜色尺寸样式不一样

不同模板的组合，逻辑 与 内容 基本相同，就首页或者个别页面内容排版可能不一样

#### 主题 - theme

一个主题可以对应多个模板

同一个主题的组合，颜色尺寸等样式一样，内容根据模板会有不同

不同主题的组合，颜色尺寸会和 scss 文件相关，scss 的配置在 `src/css/themes` 文件夹的文件夹中，以主题名称命名，目录结构如下：
```
-- src
  -- css
    -- themes
      -- <<theme>>                      // 主题名，多个单词的名称用 '_' 拼接，比如 sipc, blue, black_blue
        -- color-variable.scss          // 颜色变量
        -- common-variable.scss         // 公共 mixin 或者 function，以及所有变量的集合
        -- font-variable.scss           // 字体
        -- home-color-variable.scss     // 主页的颜色或者尺寸变量
        -- kline-var.scss               // K 线图样式变量
        -- size-variable.scss           // 尺寸变量
```

## [活动系统](https://dev.tencent.com/u/zhangzhea/p/marketing-activity-system-web) 相关

OTC 系统使用 vue + axios + rollup 搭建开发，实现 live compile，需要手动刷新，未实现 HMR

这个系统用于开发交易系统（bvip_web）以外的页面，比如活动，宣传页...等等

根据项目 demo 开发即可，规范及细则看项目的 README.md

## [OTC](https://dev.tencent.com/u/zhangzhea/p/otc-web) 相关

OTC 系统使用 vue + vuex + vue-i18n + vue-router + vue-meta + axios + webpack 搭建开发, 在 ssr 分支实现 server render

## TO DO list

### 业务

1. 折合逻辑再改，详细请询问产品经理或者 zt 的产品经理

2. tradingview 对接

3. TAPD 对应任务与 bug

### 重构

1. bvip_web 重构

> 目录设计改变
>> 原先是页面级文件与组件分别放在 pages 与 components 文件夹，图片等静态资源也被分离在 assets 文件夹
导致关联性被分割，如果后期需要删除一些页面，对应的私有组件和私有静态资源可能会存在残留
>>> 建议用文件夹将页面，私有组件，私有静态资源归集，公共组件、公共静态资源仍然放入对应的文件夹（components, assets）

2. marketing-activity-system-web 重构

> 静态资源版本设计
>> 目前缺乏这个东西，如果活动代码发生改变，必须要去掉浏览器缓存才能看到更新内容
>>> 可以使用 hash, rollup 应该有类似插件，做了这个，还需要处理 index.html 对于静态资源加载的逻辑问题，目前比较简单

> 继续探索 rollup 实现 HMR 的方案
