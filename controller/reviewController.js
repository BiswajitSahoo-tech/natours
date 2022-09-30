const Review = require('./../model/reviewModel')
const factory = require('./handlerFactory')

// exports.getAllReviews = async (req , res , next)=>{
//     try{
//         let filter = {}
//         if(req.params.tourId)
//             filter = {
//                 tour : req.params.tourId
//             }

//         //we did the the if checking becuz if one hit our common 
//         // review router then we get all the review becuz the 
//         //filter object then is an empty object

//         // but if we try with nested router we get an filter object
//         // and then we get all reviews related to one tour only
//         const review = await Review.find(filter)

//         res.status(200).json({
//             status: 'success',
//             msg:{
//                 review
//             }
//         })

//     }catch( err){
//         next( err)
//     }
// }



exports.getAllReviews = factory.getAll(Review)
exports.get_review = factory.getOne(Review)

exports.setTourUserIds = (req , res, next)=>{
    if(!req.body.tour) 
        req.body.tour = req.params.tourId
    if(!req.body.user) 
        req.body.user = req.user._id


    next()
}




exports.createReview = factory.createOne(Review)
exports.update_review = factory.updateOne(Review)
exports.delete_review = factory.deleteOne(Review)