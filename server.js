
const mongoose = require('mongoose')
const app = require('./app')
const dotenv = require('dotenv')

dotenv.config({
    path: './config.env'
})



const DB = process.env.DATABASE
    
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( con=> {
    // console.log(con.connections)
    console.log('DB connection successfull');
}) 


// const tour1 = new Tour( {
//     name: "Cuttack",
//     price: 1000
// })
// tour1.save().then( doc => { 
//     console.log(doc)
// }).catch( err => {
//     console.log('ERROR:(((' , err)
// })


// console.log(process.env.NODE_ENV)
//console.log(process.env)

const port =process.env.PORT || 3000
app.listen(port, ()=>{
    console.log('server is waiting........')
})