const mongoose = require('mongoose');
const Story = require('../models/stories');


exports.init= function() {
    // uncomment if you need to drop the database

    // Story.remove({}, function(err) {
    //    console.log('collection removed')
    // });

    // const dob=new Date(1908, 12, 1).getFullYear();
    // let story = new Story({
    //     first_name: 'Mickey',
    //     family_name: 'Mouse',
    //     dob: dob
    // });
    // // console.log('dob: '+character.dob);
    //
    // character.save()
    //     .then ((results) => {
    //         console.log("object created in init: "+ JSON.stringify(results));
    //     })
    //     .catch ((error) => {
    //         console.log(JSON.stringify(error));
    //     });
}

