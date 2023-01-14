const mongoose = require('mongoose')

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    count: Number,
    log: [{
        description: String,
        duration: Number,
        date: String
    }]
})

module.exports = mongoose.model('User', UserSchema)