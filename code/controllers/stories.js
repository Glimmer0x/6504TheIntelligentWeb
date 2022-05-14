let Story = require('../models/stories');
const userModel = require("../models/users");

exports.getStories = function (req, res) {
    Story.
        find().
        sort({createdAt: -1}).
        exec(function (err, stories) {
            console.log(stories)
            if (err) return handleError(err);
            else {
                console.log('getStories success');
                res.json(stories);
            }
    })
}

exports.getSingleStory = function (req, res){
    let queryData = req.body;
    const title = queryData.story_title;
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
        first_name: userData.first_name,
        family_name: userData.family_name,
        story_title: userData.story_title,
        story_image: userData.story_image,
        story_description: userData.story_description,
        date: userData.date
    });
    console.log('received: ' + story);

    story.save()
        .then ((results) => {
            // res.json(results);
            res.json('Add Story Successfully');
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })


}

exports.update = function (req, res) {
    let data = req.body;
    if (data == null) {
        res.status(403).send('No data sent!')
    }
    console.log(data)
    Story.findOne({story_title: data.story_title})
        .then((instance) => {
            if(instance) {
                let info = data.story_title + 'already exists in mongoDB'
                // console.log(data.story_title + 'already exists in mongoDB');
                res.json(info);
            }else{
                console.log(data)
                let story = new Story({
                    first_name: data.first_name,
                    family_name: data.family_name,
                    story_title: data.story_title,
                    story_image: data.story_image,
                    story_description: data.story_description,
                    date: data.date
                });
                story.save()
                    .then ((results) => {
                        // res.json(results);
                        res.json('Add Story Successfully');
                    })
                    .catch ((error) => {
                        res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
                    })
            }
        })
        .catch((err) => {
            res.status(400).json('Error: Bad Request!')
        });


}
// Moongose 5.8.11 doesn't support arrow functions with getters (and presumably setters).