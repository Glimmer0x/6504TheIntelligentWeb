let Story = require('../models/stories');
const userModel = require("../models/users");

exports.getStories = function (req, res) {
    /*
    #swagger.description = 'Get all stories.'
    */
    Story.
        find().
        sort({createdAt: -1}).
        exec(function (err, stories) {
            // console.log(stories)
            if (err) return handleError(err);
            else {
                /* #swagger.responses[200] = {
                       schema: [{$ref: "#/components/schemas/Story"}],
                       description: 'Get all stories successfully.'
                } */
                res.status(200).json(stories);
                console.log('get all stories success');
            }
    })
}

exports.getSingleStory = function (req, res){
    /*
    #swagger.description = 'Get a single story with given title.'
    */

    let queryData = req.body;
    const title = queryData.story_title;
    if(title){
        Story.findOne({story_title: title})
            .then((instance) => {
                if(instance) {
                    /* #swagger.responses[200] = {
                    schema: { $ref: "#/components/schemas/Story" },
                    description: 'Get a single story by title successfully.'
                    } */
                    res.status(200).json(instance);
                    console.log('get single story success');
                }else{
                    /* #swagger.responses[404] = {
                    description: 'Did not find a story by given title.'
                    } */
                    res.status(404).json('Error: Story not exist!')
                    console.log('Error in get single story')
                }
            })
            .catch((error) => {
                /* #swagger.responses[500] = {
                    description: 'Internal Server Error.'
                }
                */
                res.status(500).json('Could not find a story. Error: ' + JSON.stringify(error));
            });
    }
    else{
        /* #swagger.responses[400] = {
            description: 'Bad request. Title received is null.'
        }
        */
        res.status(400).send('Bad request. Title received is null');
    }
}


exports.insert = function (req, res) {
    /*
    #swagger.description = 'Add a new story.'
    */

    let userData = req.body;
    if (userData == null) {
        /* #swagger.responses[400] = {
            description: 'Bad request. Story data received is null.'
        }
        */
        res.status(400).send('Bad request. Story data received is null.')
    }
    
    let story = new Story({
        first_name: userData.first_name,
        family_name: userData.family_name,
        story_title: userData.story_title,
        story_image: userData.story_image,
        story_description: userData.story_description,
        date: userData.date
    });

    story.save()
        .then ((results) => {
            /* #swagger.responses[201] = {
            description: 'Add a story successfully.'
            }
            */
            res.status(201).json('Add Story Successfully');
            console.log('Add Story Successfully');
        })
        .catch ((error) => {
            /* #swagger.responses[500] = {
                description: 'Internal Server Error. Could not insert - probably incorrect data!'
            }
            */
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })


}

exports.update = function (req, res) {
    /*
    #swagger.description = '@update story. when system goes online from offline, it will check if the story in indexDB exists in mongoDB, if not, insert the story into mongoDB'
    */
    let data = req.body;
    if (data == null) {
        /* #swagger.responses[400] = {
            description: 'Bad request. Story data received is null.'
        }
        */
        res.status(400).send('Bad request. Story data received is incorrect.')
    }
    Story.findOne({story_title: data.story_title})
        .then((instance) => {
            if(instance) {
                let info = data.story_title + ' already exists in mongoDB'
                console.log(data.story_title + ' already exists in mongoDB');
                res.json(info);
            }else{
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
                        /* #swagger.responses[201] = {
                        description: 'Add a story successfully.'
                        }
                        */
                        res.status(201).json('Add Story Successfully');
                        console.log('Add Story Successfully')
                    })
                    .catch ((error) => {
                        /* #swagger.responses[500] = {
                            description: 'Internal Server Error. Could not insert - probably incorrect data!'
                        }
                        */
                        res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
                    })
            }
        })
        .catch((error) => {
            res.status(400).json('Error: Bad Request!')
        });
}