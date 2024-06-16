const { default: mongoose } = require('mongoose');
const mangoose = require('mongoose');

const msgSchema = mongoose.Schema({
    msg: String,
    sender: String,
    receiver: String,
})

module.exports = mongoose.model('msg',msgSchema)