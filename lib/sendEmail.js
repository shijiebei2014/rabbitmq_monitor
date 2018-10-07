// const Email = require('email').Email
const nodemailer = require('nodemailer')
const _ = require('underscore')
const config = require('../email.json')

const server = (config)

var transporter = nodemailer.createTransport({
  host: config.host,
  port: config.ssl ? 465 : 587,
  secure: config.ssl,
  auth: {
    user: config.user,
    pass: config.password
  }
})

module.exports = function(params, cb) {
    // new Email(_.extend({
    //   body: params.text,
    //   from: config.user,
    //   to: params.to,
    //   subject: '队列告警'
    // }), params).send(cb)

    transporter.sendMail({
      from: config.user,
      to: params.to,
      subject: '队列告警',
      text: params.text
    }, cb)
}
