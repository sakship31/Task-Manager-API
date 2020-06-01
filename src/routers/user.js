const express=require('express')
const User=require('../models/user')
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
const {welcomeMail,cancelMail}=require('../emails/account')
const app = new express.Router()

app.post('/users',async (req,res)=>{
    const user=new User(req.body)
    try{
        await user.save()
        welcomeMail(user.email,user.name)
        const token=await user.generatetoken()
        res.send({user,token})
    }catch(error){
        res.status(400)
        res.send(error)
    }
})

app.post('/users/login',async(req,res)=>{
    try{
        const user =await User.findCredential(req.body.email,req.body.password)
        const token=await user.generatetoken()
        res.send({token,user:user})
    }catch(e){
        res.status(404).send()
    }
})


app.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

app.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

app.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

app.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedupdate=['name','email','password','age']
    const isValidop=updates.every((update)=>allowedupdate.includes(update))

    if(!isValidop){
        return res.status(400).send({error:'Invalid updates!'})
    }

    try{
        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save()
        //const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        res.send(req.user)
    }catch(e){
        return res.status(500).send(e)
    }
})

app.delete('/users/me',auth,async (req,res)=>{
    try{
        await req.user.remove()
        cancelMail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        return res.status(500).send()
    }
})


const upload=multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(PNG|jpg|jpeg)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

app.post('/users/me/profile',auth,upload.single('avatar'),async(req,res)=>{
    req.user.avatar=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

app.delete('/users/me/profile',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

app.get('/users/:id/profile',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user||!user.avatar){
            throw new Error()
        }
        // res.set('Content-Type','img/jpg')
        res.writeHead(200,{'Content-type':'image/PNG'})
        res.end(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports=app 