const mongoose=require('mongoose')
const validator=require('validator')
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");

const taskSchema=new mongoose.Schema({
    description:{
        type: String,
        required:true,
        trim: true
    },

    completed:{
        type:Boolean,  
        default:false
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    createdAt:{
        type:Date,
        default:dateIndia
    },
    updatedAt:{
        type:Date,
        default:dateIndia
    }
})

const Task=mongoose.model('Task',taskSchema)

module.exports=Task