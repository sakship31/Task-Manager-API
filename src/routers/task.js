const express=require('express')
const Task1=require('../models/task')
const auth=require('../middleware/auth')
const app = new express.Router()

app.get('/tasks/:id',auth,async (req,res)=>{
 //   console.log(req.params)
    const _id=req.params.id
    try{
//        const task=await Task1.findById(_id)
        const task=await Task1.findOne({_id, creator:req.user._id})
        if(!task){
            return res.status(404).send()            
        }
        res.send(task)

    }catch(e){
        return res.status(500).send()       
    }
})

app.post('/tasks',auth,async (req,res)=>{
    const task1=new Task1({
        ...req.body,
        creator:req.user._id
    })
    try{
        await task1.save()
        res.status(201).send(task1)
    }catch(e){
        res.status(400)
        res.send(e)        
    }
})

//{{url}}/tasks?completed=true&limit=1&skip=0
//{{url}}/tasks?sortBy=createdAt:desc
app.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort={}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})


app.patch('/tasks/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedupdate=['description','completed']
    const isValidop=updates.every((update)=>allowedupdate.includes(update))

    if(!isValidop){
        return res.status(400).send({error:'Invalid updates!'})
    }

    try{
        const task=await Task1.findOne({_id:req.params.id,creator:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=>task[update]=req.body[update])
        await task.save()
        res.send(task)
    }catch{
        return res.status(500).send()
    }
})



app.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        //const user=await Task1.findByIdAndDelete(req.params.id)
        const task=await Task1.findOneAndDelete({_id:req.params.id,creator:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch{
        return res.status(500).send()
    }
})

module.exports=app
