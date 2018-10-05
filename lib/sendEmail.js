const Email = require('email').Email
const _ = require('underscore')
const config = require('../email.json')

const server = (config)

module.exports = function(params, cb) {
    new Email(_.extend({
      body: params.text,
      from: config.user,
      to: params.to,
      subject: '队列告警'
    }), params).send(cb)
}
