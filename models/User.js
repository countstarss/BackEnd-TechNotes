const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        require:true,
        unique:true
    },
    password: {
        type:String,
        require:true
    },
    roles:{
        type:Array,
        default:["Employee"]
    },
    active:{
        type:Boolean,
        default: true
    }
})

module.exports = mongoose.model('User',userSchema)