const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('./../../model/tourModel')
const User = require('./../../model/userModel')
const Review = require('./../../model/reviewModel')

const dotenv = require('dotenv')

dotenv.config({
    path: './config.env'
})

const tours = fs.readFileSync(__dirname+'\\tours.json')
const users = fs.readFileSync(__dirname+'\\users.json')
const reviews = fs.readFileSync(__dirname+'\\reviews.json')
const _tours = JSON.parse(tours)
const _users = JSON.parse( users)
const _reviews = JSON.parse( reviews)
n = _tours.length

const DB = process.env.DATABASE

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( async con=> {
    console.log('DB connection successfull');
})

const import_data = async ()=>{
    try{
        // await Tour.create(_tours, {validateBeforeSave: false})
        await User.create( _users , {validateBeforeSave: false})
        // await Review.create( _reviews, {validateBeforeSave: false})
    }catch( err){
        console.log( err)
    }
    

}

const destroy = async()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
    }catch( err){
        console.log( err)
    }
}

if (process.argv[2] === '-d') {
    destroy().then((msg)=>{
        console.log('Data deleted succesfully.')
    })
  } else {
    import_data().then((msg)=>{
        console.log('Data imported succesfully.')
    })
  }


