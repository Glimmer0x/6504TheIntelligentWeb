var express = require('express');
var router = express.Router();

var story = require('../controllers/stories');
var initDB = require('../controllers/init');
initDB.init();

router.get('/', function(req, res, next) {
    /*
    #swagger.description = 'Redirect to login page to verify user at first.'
    */
    return res.render('login', {errorMsg: 'Please login!'});
});

router.get('/index', function(req, res, next) {
    /*
    #swagger.description = 'Home page. Display all stories.'
    */
    res.render('index', { title: 'Story Club' });
})

router.get('/allStories', story.getStories);
router.post('/singleStory', story.getSingleStory);
router.post('/insertStory', story.insert);
router.post('/updateStory', story.update);

router.get('/history', function(req, res, next) {
    /*
    #swagger.description = 'History page. Display all stories.'
    */
    res.render('history', { title: 'Story Club' });
})

module.exports = router;
