var express = require('express');
var router = express.Router();
const {
    response
} = require('express');
const controllers = require('../controllers/index')

router.get('/profile', controllers.profile.getViewProfile)
router.get('/profile/editProfile', controllers.profile.getViewEdit)
router.post('/profile/editProfile', controllers.profile.editProfile)
router.post('/profile/logout', controllers.profile.logout)

module.exports = router