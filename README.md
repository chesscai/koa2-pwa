# KOA2-PWA
本项目是pwa推送服务器的简单实现，使用 [koa2](https://github.com/koajs/koa "koa2 github") 开发，使用 [mysql](https://dev.mysql.com/doc/ "mysql") 数据库储存，使用 [pm2](http://pm2.keymetrics.io/ "pm2") 管理进程和日志。

## 概念
[Progressive Web Apps](https://developer.mozilla.org/zh-CN/Apps/Progressive "pwa") 是渐进式Web应用程序，运行在现代浏览器并展现出超级能力。支持可发现，可安装，离线运行，消息推送等APP特有的能力，本项目以最简单的方式封装了消息推送功能在nodejs端的实现。

## 开始
koa2需要nodejs 7.6以上版本。
``` bash
# install pm2
npm install -g pm2

# install dependencies
npm install

# serve with hot reload at localhost:3000
npm start

# run with pm2
npm run prd
# or pm2 start bin/www
```

## 项目结构
本项目使用koa-generator生成目录结构。
- /bin
    - www
- /db
    - config.js
    - index.js
- /routes
    - index.js
    - notification.js
- /public
- /views
- app.js
- package.json
- package-lock.json
- README.md

## 运行过程
pwa 消息推送功能依赖于Service Worker（简称sw），使用 [VAPID 协议](https://tools.ietf.org/id/draft-ietf-webpush-vapid-03.html "web-push VAPID规范")。
![notification](https://raw.githubusercontent.com/SangKa/PWA-Book-CN/master/assets/figure6.4.png "notification")

> -> server端使用 [web-push](https://github.com/web-push-libs/web-push "web-push github") 生成vapidKeys(publicKey,privateKey)<br />
  -> server端保存publicKey,privateKey，前端保存publicKey<br />
  -> 前端sw使用加密后的publicKey去订阅并获得订阅对象，然后保存到server端<br />
  -> server端在需要推送时获取订阅对象即可推送

项目目录中，app.js是启动文件，/bin/www是启动文件的封装，一般使用www启动服务；<br />
/public是web静态文件，/views是网页模板；<br />
重点来看/db和/routes，显然/db是跟数据库相关，/routes是跟路由相关。
```js
// /db/config.js 保存数据库登录信息
const config = {
  host: ***,
  user: ***,
  password: ***,
  database: '***', // 数据库名称，自定义
  port: ***
}
module.exports = config

// /db/index.js 数据库相关操作
const mysql = require('mysql')
const config = require('./config')

const pool = mysql.createPool(config)

// some sql

module.exports = {
  // some methods
}
```
**/routes/notification.js:**<br />
更多推送消息配置项 [Notification options](https://developer.mozilla.org/en-US/docs/Web/API/notification/Notification "配置项")
```js
const router = require('koa-router')()
const webpush = require('web-push')
const dbModel = require('../db/index')

// VAPID keys should only be generated only once.
// const vapidKeys = webpush.generateVAPIDKeys()
const publicKey = '***'
const privateKey = '***'
const gcmapiKey = 'PWA_LITE_GCMAPIKey' // 自定义，保存在前端manifest.json
const mailto = 'mailto:yourname@mail.com'

// send notification to client
const sendNotification = (pushSubscription, body) => {
  return webpush.sendNotification(pushSubscription, JSON.stringify(body))
}

webpush.setGCMAPIKey(gcmapiKey)
webpush.setVapidDetails(mailto, publicKey, privateKey)

// router prefix
router.prefix('/api/notification')

// user subscribe
router.post('/subscribe', async (ctx, next) => {
  let body = ctx.request.body
  let user = [body.authSecret, body.key, body.endpoint]
  let pushSubscription = {
    endpoint: body.endpoint,
    keys: {
      auth: body.authSecret,
      p256dh: body.key
    }
  }
  let body = {
    title: 'Congratulations',
    message: `Hello,Thank you for subscribtion!`,
    data: {}
  }
  sendNotification(pushSubscription, body)
  // do something
})

module.exports = router
```