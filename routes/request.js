var express = require('express');
var router = express.Router();
const {
    response
} = require('express');
const controllers = require('../controllers/index')

router.get('/request', controllers.request.getViewReqPending)
router.get('/request/completed', controllers.request.getViewsReqComp)
router.get('/request/pending/:user_id/:id_penerima/:document_id', controllers.request.accPending)
router.get('/request/pending/decline/:user_id/:id_penerima/:document_id', controllers.request.declinePending)
router.get('/request/pending/detailReq/:document_id', controllers.request.getViewsDetailReq)

module.exports = router