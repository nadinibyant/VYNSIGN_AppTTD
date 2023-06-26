const user = require('./user')
const management = require('./management')
const sent = require('./sent')
const request = require('./request')
const profile = require('./profile')
const password = require('./password')


const controllers = {}

controllers.user = user
controllers.management = management
controllers.sent = sent
controllers.request = request
controllers.profile = profile
controllers.password = password

module.exports = controllers