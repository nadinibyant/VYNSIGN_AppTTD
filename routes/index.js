const sent = require('./sent.js')
const user = require('./user.js')
const management = require('./management.js')
const request = require('./request.js')
const profile = require('./profile.js')
const password = require('./password.js')
const server = {}

server.user = user
server.management = management
server.sent = sent
server.request = request
server.profile = profile
server.password = password


module.exports = server