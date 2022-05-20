let userModel = require('../models/users');

exports.checkUser = function (req, res) {
    /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'Verify a user',
            schema: { $ref: '#/components/schemas/User' }
    }
    */

    let userData = req.body;
    if (userData == null) {
        /* #swagger.responses[400] = {
            description: 'Bad request. Data received is null.'
        }
        */
        res.status(400).send('Bad request. Data received is null.')
    }
    const username = userData.username;
    const password = userData.password;
    userModel.findOne({username: username})
        .then((singleUser) => {
            if(singleUser?.password===password) {
                /* #swagger.responses[200] = {
                description: 'Verify a user successfully.'
                }
                */
                res.status(200);
                res.render('index', {title: 'Story Club', username});
            }else{
                /* #swagger.responses[403] = {
                description: 'User not exist or password incorrect.'
                }
                */
                res.status(403);
                res.render('login', {errorMsg: "User not exist or password incorrect"})
            }
        })
        .catch((error) => {
            /* #swagger.responses[500] = {
                description: 'Internal Server Error. Could not verify a user - probably incorrect data.'
            }
            */
            res.status(500);
            res.render('login', {errorMsg: error.message});
        });
}

exports.insert = function (req, res) {
    /* #swagger.parameters['body'] = {
                in: 'body',
                description: 'Adding new user',
                schema: { $ref: '#/components/schemas/User' }
    }
    */

    let userData = req.body;
    if (userData == null) {
        /* #swagger.responses[400] = {
            description: 'Bad request. Data received is null.'
        }
        */
        res.status(400).send('Bad request. Data received is null.')
    }

    let singleUser = new userModel({
        username: userData.username,
        password: userData.password
    });
    console.log('received: ' + singleUser);

    singleUser.save()
        .then ((results) => {
            /* #swagger.responses[201] = {
            description: 'Add a user successfully.'
            }
            */
            res.status(201).send('Add a user successfully');
        })
        .catch ((error) => {
        /* #swagger.responses[500] = {
            description: 'Internal Server Error. Could not add a user - probably incorrect data.'
        }
        */
        res.status(500).send('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })
}