let userModel = require('../models/users');

exports.getSingleUser = function (req, res) {
    let userData = req.body;
    const username = userData.username;
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

exports.checkUser = function (req, res) {
    let userData = req.body;
    const username = userData.username;
    const password = userData.password;
    userModel.findOne({username: username})
        .then((singleUser) => {
            if(singleUser?.password===password) {
                res.render('index', {title: 'Story Club', username});

                // res.status(200).json({
                //     success: true,
                //     message: `Find ${singleUser.username}`,
                //     user: singleUser,
                // });
            }else{
                res.render('login', {errorMsg: "User not exist"})
            }
        })
        .catch((err) => {
            res.render('login', {errorMsg: err.message});
        });
}

exports.insert = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }

    let singleUser = new userModel({
        username: userData.username,
        password: userData.password
    });
    console.log('received: ' + singleUser);

    singleUser.save()
        .then ((results) => {
            res.json({results:results, redirect_url: '/login'});
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })


}

// Moongose 5.8.11 doesn't support arrow functions with getters (and presumably setters).