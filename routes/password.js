var express = require('express');
var router = express.Router();
const {
    response
} = require('express');
const controllers = require('../controllers/index')


router.get('/password/ForgetPass', controllers.password.getViewForgetPass)
router.post('/password/ForgetPass', controllers.password.ForgetPass)
router.get('/password/ResetPass/:email', controllers.password.tampilReset)
router.post('/password/ResetPass/:email', controllers.password.resetPass)
router.get('/password/ResetPass2/:email', controllers.password.getResetPass2)
router.post('/password/ResetPass2/:email', controllers.password.finalReset)

module.exports = router