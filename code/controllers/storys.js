let Story = require('../models/storys');
const userModel = require("../models/users");

exports.getStorys = function (req, res) {
    Story.
        find().
        sort({createdAt: -1}).
        exec(function (err, storys) {
            if (err) return handleError(err);
            else {
                console.log('getStorys success');
                res.json(storys);
            }
    })
}

exports.getSingleStory = function (req, res){
    let queryData = req.body;
    const title = queryData.title;
    Story.findOne({story_title: title})
        .then((instance) => {
            if(instance) {
                console.log('Get single story success');
                res.json(instance);
            }else{
                console.log('Error in get single story')
                res.status(404).json('Error: Story not exist!')
            }
        })
        .catch((err) => {
            res.status(400).json('Error: Bad Request!')
        });
}


exports.insert = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    
    let story = new Story({
        first_name: userData.firstname,
        family_name: userData.lastname,
        story_title: userData.title,
        story_image: userData.image,
        story_description: userData.description,
    });
    console.log('received: ' + story);

    story.save()
        .then ((results) => {
            res.json(results);
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })


}

// Moongose 5.8.11 doesn't support arrow functions with getters (and presumably setters).