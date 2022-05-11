let Story = require('../models/storys');

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