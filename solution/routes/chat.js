var express = require('express');
var router = express.Router();

router.get("/chat/story/:title", function(req, res, next) {
    /*
    #swagger.description = 'Enter a chat room.'
    #swagger.parameters['title'] = {
            in: 'path',
            description: 'Title of a selected story for discussion',
            schema: { $ref: '#/components/schemas/User' }
    }
    */

    if(req.params.title){
        console.log(req.params.title)
        res.render('chat', { title: 'My Chat' , storyTitle: req.params.title});
    }
    else {
        /* #swagger.responses[400] = {
            description: 'Bad request. Title received is null.'
        }
        */
        res.status(400).send('Bad request. Title received is null');
    }

});

module.exports = router;
