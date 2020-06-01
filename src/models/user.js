const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");

const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age:{
        type:Number,  
        default:0
    },
    avatar:{
        type:Buffer
    },
    password:{
        type:String,
        trim:true,
        validate(value){
            if(value.length<=6){
                throw new Error('Length should be greater than 6')
            }
            else{
             if((value.includes("password"))){
                 throw new Error('Should not include word password')
             }
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    createdAt:{
        type:Date,
        default:dateIndia
    },
    updatedAt:{
        type:Date,
        default:dateIndia
    }
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'creator'
})

userSchema.methods.toJSON = function(){
    const user=this
    const userObj=user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.methods.generatetoken= async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findCredential=async(email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const check=await bcrypt.compare(password,user.password)
    if(!check){
        throw new Error('Unable to login')        
    }
    return user
}

userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({creator:user._id})
    next()
})

userSchema.pre('save',async function(next){
    const user=this
    
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }

    next()
})

const User=mongoose.model('User',userSchema)

module.exports=User