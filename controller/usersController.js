
const AppError = require('./../util/appError')
const User = require('./../model/userModel')
const multer = require('multer')
const factory = require('./handlerFactory')
const sharp = require('sharp')//--> img processing library

//complete defination of how and where we store incoming img in 
//form data
//diskStorage() --> Returns a StorageEngine implementation 
//configured to store files on the local file system.
// const multerStorage = multer.diskStorage( {
//     destination: ( req, file, cb)=>{
//         cb( null , 'public/img/users');
//     },
//     filename: ( req, file , cb)=>{
//         //'user-112ffnfjjj-2322424.jpeg'
//         const ext = file.mimetype.split('/')[1]
//         cb(null , 'user-'+req.user.id+'-'+Date.now()+'.'+ext)

//     }
// })

//this below way the photo stored in main memory
//and not written into the disk
//becuz we want that file , in future middleware, for img processing
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
exports.uploaduserPhoto = upload.single('photo') ;


exports.resizeUserPhoto = async ( req, res, next)=>{
    if(! req.file) 
        return next()
    req.file.filename = 'user-'+req.user.id+'-'+Date.now()+'.jpeg'

    await sharp( req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
        .toFile('public/img/users/' + req.file.filename)

    next()
}


const filterObj = (obj , ...allowedFields)=>{
    var newObj = {}
    Object.keys(obj).forEach(elm => {
        if(allowedFields.includes(elm)){
            newObj[elm] = obj[elm]
        }
    })
    return newObj
}

exports.get_all_user = factory.getAll(User)
exports.create_user= (req , res) =>{
    res.status(500).json({
        status : "error",
        message: "this route on working"
    })
}
exports.get_user = factory.getOne(User)
//dont update password here- becuz save middleware doesnot run on it
exports.update_user = factory.updateOne(User)
exports.delete_user = factory.deleteOne(User)

exports.updateMe = async (req , res ,next)=>{

    //create error if user post password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for pwd update,' ,400 ))
    }
    const filteredBody = filterObj(req.body , 'name' , 'email')
    if(req.file) filteredBody.photo = req.file.filename
    try{
        const updatedUser = await User.findByIdAndUpdate(req.user._id , filteredBody,{
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status:'success',
            updatedUser
        })
    }catch( err){
        return next( err)
    }

    
    

    
    //update the user document
}

exports.deleteMe = async (req, res, next)=>{
    try{
        await User.findByIdAndUpdate(req.user._id,{active: false})
        res.status(200).json({
            status:'success'
            
        })
    }catch( err){
        return next( err)
    }
}

exports.getMe=(req, res, next)=>{
    req.params.id = req.user._id
    next();
}
    