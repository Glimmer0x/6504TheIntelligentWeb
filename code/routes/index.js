var express = require('express');
var router = express.Router();

var story = require('../controllers/stories');
var initDB = require('../controllers/init');
initDB.init();

router.get('/', function(req, res, next) {
    return res.render('login', {errorMsg: 'Please login!'});
});

router.get('/index', function(req, res, next) {
  res.render('index', { title: 'Story Club' });
})

router.get('/allStories', story.getStories);
router.post('/singleStory', story.getSingleStory);
router.post('/insertStory', story.insert);
router.post('/updateStory', story.update)

module.exports = router;
