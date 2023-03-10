const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./database')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded())
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://eskimo:eskimo@cluster0.21cwi.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


app.post('/api/users', (req, res, next) => {

 let newUser = new User({
      username: req.body.username,
      count: 0,
      log: []
    })
    newUser.save((err, data) => {
      if(err) {
        return next(err)
      }
      res.json({_id: data._id, username: data.username})
    })
    
})

app.get('/api/users', (req, res) => {
 User.find().then(data => {
  let users = []
  for (let i = 0; i < data.length; i++){
    users.push({ _id: data[i]._id, username: data[i].username})
  }
  res.json(users)
 })
})


app.post('/api/users/:_id/exercises', (req, res, next) =>{
  
  let givenDate = !req.body.date ? new Date() : req.body.date
  User.findById(req.params._id, (err, user) =>{
    if(err){
      return next(err)
    }
    user.log.push({
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(givenDate)
    })
    user.count = user.log.length
    user.save((err, data) => {
      if(err) {
        return next(err)
      }
      res.send({
        username: data.username,
        description: data.log[user.log.length - 1].description,
        duration: data.log[data.log.length - 1].duration,
        date: new Date(data.log[data.log.length - 1].date).toDateString(),
        _id: data._id
      })
    })
  })
})



app.get('/api/users/:_id/logs', (req, res, next) => {
  if(req.query.from || req.query.to || req.query.limit){
    User.findById(req.params._id, (err, user) => {
      if(err){
        return next(err)
      }
      let d1 = new Date(req.query.from)
      let d2 = new Date(req.query.to)
      let newLog = user.log.map(log => {
        if(d1 <= new Date(log.date) || d2 >= new Date(log.date)){
          return {
            description: log.description,
            duration: log.duration,
            date: new Date(log.date).toDateString()
          }
        }else {
          user.count -= 1
          return
        }
      }).slice(0, req.query.limit || user.count)
      res.json({
        username: user.username,
        _id: user._id,
        count: user.count,
        log: newLog
      })
    })
  }else{
    User.findById(req.params._id, (err, user) => {
      if(err){
        return next(err)
      }
      res.json({
        username: user.username,
        count: user.count,
        _id: user._id,
        log: user.log.map(log => {
          return {
            description: log.description,
            duration: log.duration,
            date: new Date(log.date).toDateString()
          }
        })
      })
    })
  }
})