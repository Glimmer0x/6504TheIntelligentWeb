var express = require('express');
var users = require('../controllers/users');
var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', users.checkUser);

router.post('/logout', function(req, res, next) {
  res.redirect('/');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
})
    .post('/signup', users.insert);

module.exports = router;