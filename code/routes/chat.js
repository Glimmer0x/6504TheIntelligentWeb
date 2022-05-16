var express = require('express');
var router = express.Router();

router.get("/chat/story/:title", function(req, res, next) {
    console.log(req.params.title)
    res.render('chat', { title: 'My Chat' , storyTitle: req.params.title});
});

module.exports = router;
