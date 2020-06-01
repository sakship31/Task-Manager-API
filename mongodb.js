// const mongodb = require('mongodb')
// const MongoClient=mongodb.MongoClient
// const ObjectID=mongodb.ObjectID

const {MongoClient,ObjectID}=require('mongodb')

const connectionURL='mongodb://127.0.0.1:27017'
const databaseName='task-app'

MongoClient.connect(connectionURL,{useNewUrlParser:true},(error,client)=>{
    if(error){
        return console.log('Unable to connect to database')
    }

    const db=client.db(databaseName)
     db.collection('users').findOne({ _id: new ObjectID("5eb9ce5f48352f2a408f2fdd")},(error,user)=>{
        if(error){
            return console.log('Unable to fetch')
        }
        console.log(user)
    })

 db.collection('users').updateOne({ _id:new ObjectID("5eb9ce5f48352f2a408f2fdd")},{$inc:{age:1}}).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })

})

// ObjectId("5eb9ce5f48352f2a408f2fdd")