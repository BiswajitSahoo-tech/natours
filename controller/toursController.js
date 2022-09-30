
const Tour = require('./../model/tourModel')
const fs = require('fs')
const { throws } = require('assert')
// const APIFeatures = require('./../util/apiFeatures')
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/appError')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')//--> img processing library

// const User  = require('./userModel')


const multerStorage = multer.memoryStorage() 

const multerFilter = (req,file,cb)=>{
    if( file.mimetype.split('/')[0] === 'image'){
        cb(null , true)
    } else{
        cb( new AppError('Please upload only images', 400) , false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

//for mix size upload, means for some field we have 
// one image and for another we have multple images
exports.uploadTourImages = upload.fields([
    {name: 'imageCover' , maxCount: 1},
    {name: 'images', maxCount: 3}
]);


// //for single image upload
// upload.single('image') --> set req.file
// //for multiple images upload, with the field name and maxcount
// upload.array('images', 5) --> req.files

exports.resizeTourImages =async (req, res, next )=>{
    //multiple files in multer set req.file
    // console.log( req.files)

    if( ! req.files.imageCover || ! req.files.images){
        return next()
    }

    //1) cover images
    const imageCoverFilename = 'tour-'+req.params.id+'-'+Date.now()+'-cover.jpeg'
    await sharp( req.files.imageCover[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
        .toFile('public/img/tours/'+imageCoverFilename)

    req.body.imageCover = imageCoverFilename

    req.body.images = []

    // we can use here a foreach method but that 
    // will create an error because 
    // the callback is an async
    //therefore we are using .map() which will return 
    // an array of promises
    // and then we await all the promises
    await Promise.all( 

        //below map will return an array of promises
        req.files.images.map(async (file,index) => {
        const filename = 'tour-'+req.params.id+'-'+Date.now()+'-'+(index+1)+'.jpeg'

        await sharp( file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
        .toFile('public/img/tours/'+filename)

        req.body.images.push(filename)
    })

    
    );

   
    next()
}

// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'))

exports.getTourStats = async (req , res) =>{
    try{
        let stats =  await Tour.aggregate( [
            {
                $match: {price : {$gte : 400}}
            },
            {
                $group: {
                    _id : '$difficulty',
                    min: {$min: '$price'},
                    max: {$max: '$price'},
                    avgRating : { $avg: '$ratingsAverage'},
                    countRating: { $sum: '$ratingsQuantity'},
                    numTour: {$sum : 1}
                }
            },
            {
                $sort: { avgRating: 1}
            }
        ])

        res.status(200).json({
            status:'success',
            data:{
                stat:stats
            }
        })

    }catch(err){
        res.status(404).json({
            status: 'failllll',
            msg: err
        })
    }
}
exports.top5chepfill = (req , res , next) => {
    req.query.limit = '5';
    req.query.sort = 'price,-ratingsAverage'
    next()
}


exports.get_all_tours = factory.getAll(Tour)
// exports.get_all_tours = async (req, res,next) => {
//         // let intialQuery = Tour.find()
//         // let object = new APIFeatures(intialQuery , req)
//         //                 .filter()
//         //                 .sort()
//         //                 .limitFields()
//         //                 .pagination()
//         // const tours_arr = await object.query


//         // res.status(200).json({
//         //     status: 'success',
            
//         //     count : tours_arr.length,
//         //     data  : {
//         //         tours: tours_arr
//         //     }
//         // })
//     try{

//         // //copy an object
//         // const qObj = {...req.query}
//         // //removing excluding term from query object
//         // const excld_arr = [ 'sort' , 'page' , 'limit' , 'fields']
//         // excld_arr.forEach(elm => {
//         //     delete qObj[elm]
//         // })
//         // //Filter Object
//         // // {duration: 5,rating:4.5}
//         // // {duration:{ $lt : 5} , rating:{ $gte : 4.5}} -> MongoDB required
//         // //{duration:{ lt : 5} , rating:{ gte : 4.5}} -> express gives from req.query
//         // let qstr = JSON.stringify(qObj)
//         // qstr = qstr.replace(/\b(gt|gte|lt|lte)\b/g , match=> '$'+match)


//         // console.log(req.query)
//         // console.log(JSON.parse(qstr))
//         // // const tours_arr = await Tour.find(qObj)
//         // // const tours_arr = await Tour.find().where('duration').equals(5)

//         // //get Query Object
//         // let query = Tour.find(JSON.parse(qstr))

//         //sorting functionality
//         // if(req.query.sort){
//         //     let str = req.query.sort.split(',').join(' ')
//         //     console.log(str)
//         //     query = query.sort(str) // query.sort('price Avgrate')
//         // }else{
//         //     query = query.sort('createdAt')
//         // }

//         //limiting fields
//         // if(req.query.fields){
//         //     //query = query.select('name price discount')// only include name price and discount
//         //     //query = query.select('-name price') // for not including name 
//         //     //req.query.field = 'name,price,-discount'
//         //     let str = req.query.fields.split(',').join(' ')
//         //     query = query.select(str)
//         // }else{
//         //     query = query.select('-__v')
//         // }

//         //pagination
//         //?page=2&limit=10
//         //rew.query = {page: '2' , limit: '10'}
//         // let pge = (req.query.page*1) || 1
//         // let lmt = (req.query.limit*1)||100 
//         // query = query.skip((pge-1)*lmt).limit(lmt)

//         // if(req.query.page){
//         //     const n = await Tour.countDocuments() // count the number of the documents that matches the query
//         //     if( n <= (pge-1)*lmt)
//         //         throw new Error('Too much to skip')
//         // }

//         //execute the Query
//         let intialQuery = Tour.find()
//         let object = new APIFeatures(intialQuery , req)
//                         .filter()
//                         .sort()
//                         .limitFields()
//                         .pagination()
                    

//         const tours_arr = await object.query


//         res.status(200).json({
//             status: 'success',
            
//             count : tours_arr.length,
//             data  : {
//                 tours: tours_arr
//             }
//         })
//     }catch(err){
//         next( err)
//     }
    
// }

// exports.checkBody = (req , res , next )=>{
//     if(!req.body.price || !req.body.name){
//         return res.status(400).json({
//             status : "fail",
//             message : "Wrong body"
//         })
//     }
//     next();
// }


exports.get_tour = factory.getOne(Tour , { path: 'reviews'})
// exports.get_tour = async (req, res,next) => {
//     // const tour = await Tour.findOne( {_id : req.params.id})

//     // //adding 404 error - data not found
//     // if(!tour){
//     //     return next( new AppError('Id is not found',404))
//     // }
//     // res.status(200).json({
//     //     status:'success',
//     //     body: tour
//     // })
//     try{
//         // const tour = await Tour.findById( req.params.id )
//         const tour = await Tour.findOne( {_id : req.params.id}).populate({
//             path: 'reviews',
            
//         })
//         if(!tour){
//                 return next( new AppError('Id is not found',404))
//             }
//         res.status(200).json({
//             status:'success',
//             body: tour
//         })
//     }catch( err){
//         res.status(404).json({
//             status:'fail',
//             msg: 'something goes wrong'
//         })
//     }




//     // console.log(req.params)
//     // const tour = tours.find( elm => elm.id == req.params.id)
//     // if(tour === undefined){
//     //     return res.status(404).json({
//     //         status : "fail",
//     //         message: "wrong id!"
//     //     })
//     // }
    

// }



exports.addTour = factory.createOne(Tour)
// exports.addTour = async (req ,res) => {

//     try{
//         const doc = await Tour.create(req.body)
//         res.status(201).json({
//             status : 'success',
//             data: doc
//         })
//     }catch(err){
//         res.status(400).json({
//             status : 'fail',
//             msg: err
//         })

//     }

//     // const newTour = new Tour(req.body)
//     // newTour.save().then(doc => {
//     //     res.status(201).json({
//     //         status: "success",
//     //         data: doc
//     //     })
//     // }).catch(err => {
//     //     res.status(400).json({
//     //         status: "fail",
//     //         data: err
//     //     })
//     // })
    

//     // //data from client
//     // // console.log(req.body)
//     // const id = tours[tours.length -1].id +1;
//     // const newT = Object.assign({id:id} , req.body)
//     // tours.push(newT)
//     // fs.writeFile('./dev-data/data/tours-simple.json',JSON.stringify(tours)
//     // , err =>{
//     //     console.log('updated.');
//     //     res.status(201).json({
//     //         status: "success",
//     //         data: newT
//     //     })
//     // })
//     //console.log('hehe..')
//     //res.send('done')
// }

exports.update_tour = factory.updateOne(Tour)
// exports.update_tour = async (req, res) => {
//     try{
//         const tour = await Tour.findByIdAndUpdate(req.params.id , req.body , {
//             new: true,
//             runValidators: true
//         })

//         if(!tour){
//             return next( new AppError('Id is not found',404))
//         }

//         res.status(200).json({
//             status : "success",
//             body : tour
//         })
//     }catch( err){
//         res.status(404).json({
//             status: 'fail',
//             msg: err
//         })
//     }

//     // if( req.params.id * 1 > tours.length){
//     //     return res.json({
//     //         status : "success",
//     //         message : "wrong id"
//     //     })
//     // }
//     // const id = req.params.id * 1 
//     // const d = req.body.duration ;
//     // tours[id].duration = d
//     // fs.writeFile('./dev-data/data/tours-simple.json' , JSON.stringify(tours) , err => {
//     //     console.log('updated..')
//     //     res.status(200).json({
//     //         status : "success",
//     //         body : tours
//     //     })
//     // })
// }

// exports.delete_tour = async (req , res )=> {
//     try{
//         const query = await Tour.findByIdAndDelete(req.params.id)
//         if(!query){
//             return next( new AppError('Id is not found',404))
//         }
//         res.status(200).json({
//             status: 'success',
//             msg: query
//         })
//     }catch( err){
//         res.status(404).json( {
//             status: 'fail',
//             msg: err
//         })
//     }
// }
exports.delete_tour = factory.deleteOne(Tour)

exports.getMonthlyPlan = async (req ,res)=>{
    try{
        const year = req.params.year*1
        const plan = await Tour.aggregate( [ 
            {
                $unwind:  '$startDates'
            },
            {
                $match: {
                    startDates:{
                        $gte: new Date(year+'-01-01'),
                        $lte: new Date(year+'-12-31')
                    }
                }
            },
            {
                $group:{
                    _id: {$month :'$startDates'},
                    count: {$sum:1},
                    tours:{$push:'$name'}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: { _id:0}
            },
            {
                $sort: { count: -1}
            },
            {
                $limit: 12
            }
        ])
        res.status(200).json({
            status: 'success',
            plan
        })

    }catch(err){
        res.status(404).json( {
            status: 'fail',
            msg: err
        })
    }
}


exports.getToursWithin = async (req, res, next)=>{
    const {distance , latlng, unit} = req.params
    const {lat, lng} = latlng.split(',')

    if(!lat || !lng){
        next( new AppError('Please provide lat,lng' , 400))
    }

    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1


    // it is imp to define a index on the startLocation, before find()
    const tours = await Tour.find({ 
        startLocation: {
            //a mongoBD geospatial query operator
            //select documents that exist between the
            //specified area only work on the 
            //geoJSON object
            $geoWithin: {
                //$centerSphere is a shape operator
                //first mentaion lng then lat
                $centerSphere: [ [lng, lat] , radius]
            }
        }
    })
    
    res.status(200).json({
        status:'success',
        results: tours.length,
        data:{
            data: tours
        }
    })
}

exports.getDistances = async (req, res , next) =>{
    const {latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')
    
    if(lat === "" || lng === ""){
        next( new AppError('Please provide lat,lng' , 400))
    }
    

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    //in order to calculate we use aggregate
    const distances = await Tour.aggregate([
        {
            //this need to be first stage on aggregate
            //this need atleast one geoJson Index
            //if geoJSON index is one
            //then it will automaticaly considear the startingLocation
            //is the only one geoSpatial aggregation function
            $geoNear: {
                near : {
                    type: 'Point',
                    coordinates: [ lng*1 , lat*1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance:1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status:'success',
        
        data:{
            data: distances
        }
    })
}