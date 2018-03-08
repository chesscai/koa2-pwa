const router = require('koa-router')()
const webpush = require('web-push')
const dbModel = require('../db/index')

// VAPID keys should only be generated only once.
// const vapidKeys = webpush.generateVAPIDKeys()
const publicKey = '***'
const privateKey = '***'
const gcmapiKey = 'PWA_LITE_GCMAPIKey' // 自定义，保存在前端manifest.json
const mailto = 'mailto:yourname@mail.com'

webpush.setGCMAPIKey(gcmapiKey)
webpush.setVapidDetails(mailto, publicKey, privateKey)

async function sendNotification(pushSubscription, body) {
  return webpush.sendNotification(pushSubscription, JSON.stringify(body))
}

async function sendCongratulations(pushSubscription, userId) {
  let body = {
    title: 'Congratulations',
    body: `Hello user${userId},Thank you for subscribtion!`,
    data: {}
  }
  return sendNotification(pushSubscription, body)
}

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
  try {
    let res = await dbModel.subscribe(user)
    ctx.body = {
      ERROR_CODE: 'SUCCESS',
      user_id: res.insertId
    }
    await sendCongratulations(pushSubscription, res.insertId).catch(err => {})
  } catch (err) {
    ctx.throw(err)
  }
})

module.exports = router
