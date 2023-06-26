var express = require('express');
var router = express.Router();
const {
    response
} = require('express');
const controllers = require('../controllers/index')

router.get('/management', controllers.management.managamentTampil)
router.get('/management/allDoc', controllers.management.allDoc)
router.get('/management/addDoc', controllers.management.tampilAddDoc)
router.post('/management/addDoc', controllers.management.addDoc)

router.get('/management/detailDoc/:docId', controllers.management.tampilDetailDoc)
router.get('/management/editDoc/:docId', controllers.management.tampilEditDoc)
router.post('/management/editDoc/:docId', controllers.management.editDoc)
router.delete('/management/delDoc/:docId/users/:id_user', controllers.management.delDoc)



module.exports = router