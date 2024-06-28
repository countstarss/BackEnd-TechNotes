const mongoose = require('mongoose')
// 添加一个第三方库，让ticket有一个类似MySQL自增长的功能
const AutoIncrement = require('mongoose-sequence')(mongoose)


const noteSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User'
    },
    title: {
        type:String,
        require:true
    },
    text: {
        type:String,
        default:"Default String"
    },
    completed: {
        type:Boolean,
        default:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
},{
    timestamps:true
}
)

// 添加自增长插件
noteSchema.plugin(AutoIncrement,{
    // ? ? ? 
    inc_field:'ticket',
    id:"ticketNums",
    start_seq: 500 // 从500开始计数
})

module.exports = mongoose.model('Note',noteSchema)