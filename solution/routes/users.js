var express = require('express');
var users = require('../controllers/users');
var router = express.Router();

router.get('/login', function(req, res, next) {
  /*
  #swagger.description = 'Login page.'
  */
  res.render('login',{errorMsg: null});
});

router.post('/login', users.checkUser);

router.post('/logout', function(req, res, next) {
  /*
  #swagger.description = 'Logout. Simply go back to login page.'
  */
  res.redirect('/');
});

router.get('/signup', function(req, res, next) {
  /*
  #swagger.description = 'Sign page.'
  */
  res.render('signup');
})
    .post('/signup', users.insert);

module.exports = router;