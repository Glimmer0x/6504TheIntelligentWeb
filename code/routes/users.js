var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login/password', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

router.post('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
})
    .post('/signup', function(req, res, next) {
        console.log(req.body.username);
        console.log(req.body.password);
        res.redirect('/login');
    });


module.exports = router;