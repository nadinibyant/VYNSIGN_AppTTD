var express = require('express');
var router = express.Router();
const {
    response
} = require('express');
const controllers = require('../controllers/index')

router.get('/sent', controllers.sent.getViewSent)
router.get('/sent/addSign', controllers.sent.getViewSign)
router.post('/sent/addSign', controllers.sent.addSign)
router.get('/sent/detailSign/:user_id/:id_penerima/:document_id', controllers.sent.tampilDetailSign)

module.exports = router