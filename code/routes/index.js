var express = require('express');
var router = express.Router();

var story = require('../controllers/storys');
var initDB = require('../controllers/init');
initDB.init();
/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('index', { title: 'Story Club' });
})
    .post('/index', story.getStorys);
    // .post('/index', story.getStorys);

// router.post('/storys', story.getStorys);

router
    .get('/insert', function(req, res, next) {
      res.render('insert', {title: 'Insertion'});
    })

    .post('/insert', story.insert);

module.exports = router;
