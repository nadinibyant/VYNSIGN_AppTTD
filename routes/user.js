var express = require('express');
var router = express.Router();
const {
    response
} = require('express');
const controllers = require('../controllers/index')
const path = require('path');

router.get('/', (req,res) => {
    res.redirect('/signin')
})
router.post('/signup', controllers.user.signup)
router.get('/signup', (req, res) => {
    res.render('signup')
});
router.get('/signin', (req, res) => {
    res.render('signin')
});
router.post('/signin', controllers.user.signin)



module.exports = router