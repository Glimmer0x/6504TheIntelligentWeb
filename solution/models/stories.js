const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Story = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        story_title: {type: String, required: true, unique: true},
        story_image: {type: String, required: true},
        story_description: {type: String, required: true},
        date: {type: Date, required: true}
    }
);


// Virtual for a name of author
Story.virtual('name')
    .get(function () {
        return this.first_name + ' ' + this.family_name;
    });

Story.set('toObject', {getters: true, virtuals: true});

module.exports = mongoose.model('Story', Story);
