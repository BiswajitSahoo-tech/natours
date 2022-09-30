const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('./../../model/tourModel')
const User = require('./../../model/userModel')
const Review = require('./../../model/reviewModel')



const tours = fs.readFileSync('./tours.json')
const users = fs.readFileSync('./users.json')
const reviews = fs.readFileSync('./reviews.json')
const _tours = JSON.parse(tours)
const _users = JSON.parse( users)
const _reviews = JSON.parse( reviews)
n = _tours.length


const DB = process.env.DATABASE
    

const delete_ = async ()=>{
    try{
        await Tour.deleteMany()
        // await User.deleteMany()
        // await Review.deleteMany()
    }catch( err){
        console.log(err);
    }
    
}
// const addTour = async (data) => {
//     try{
//         const doc = await Tour.create(data)
//     }catch(err){
//         console.log(err);
//     }
    
//     // console.log('s')
// }


mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( async con=> {
    
    console.log('DB connection successfull');

    delete_()

    await Tour.create(_tours, {validateBeforeSave: false})
    // await User.create( _users , {validateBeforeSave: false})
    // await Review.create( _reviews, {validateBeforeSave: false})
})


