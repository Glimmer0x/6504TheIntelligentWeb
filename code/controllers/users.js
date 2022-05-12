let userModel = require('../models/users');

exports.getSingleUser = function (req, res) {
    const username = req.params.username;
    userModel.findOne({username: username})
        .then((singleUser) => {
            res.status(200).json({
                success: true,
                message: `Find ${singleUser.username}`,
                user: singleUser,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'The user does not exist',
                error: err.message,
            });
        });
}

exports.insert = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }

    let singleUser = new userModel({
        username: userData.username,
        hashed_password: userData.hashed_password
    });
    console.log('received: ' + singleUser);

    singleUser.save()
        .then ((results) => {
            res.json(results);
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })


}

// Moongose 5.8.11 doesn't support arrow functions with getters (and presumably setters).