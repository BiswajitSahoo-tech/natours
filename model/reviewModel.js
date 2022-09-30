const mongoose = require("mongoose");
const Tour = require("./tourModel");
const User = require("./userModel");

const reviewSchemaObject = {
    review: {
        type: String,
        required: [true , 'A review must have a review']
    },
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type : mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true , 'A review must belong to a tour']
    },
    user: {
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true , 'A review must belong to a user']
    }
}

const SchemaOption = {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
}

const reviewSchema = new mongoose.Schema( reviewSchemaObject , SchemaOption)


reviewSchema.index({tour: 1, user: 1}, {unique: true})

//Query Middleware
reviewSchema.pre(/^find/ ,async function(next){
    try{
        // this.populate({
        //     path: 'tour',
        //     select:'name'
        // })
        this.populate({
            path:'user',
            select: 'name photo'
        })
    }catch( err){
        next( err)
    }
    
    next()
})


//below function use an aggregate function to calculate a nRating and avgRating
// of all the review of given id.
//id will come from post save middleware and which have tourId on the 
//respective doc , and then it start aggregating and atlast
// we update the corresponding tour data
//why? we define below function as a static on CLass not an instance
//becuz we want to run aggregate pipeline which will only run 
//on Class/Model


reviewSchema.statics.calcsAverageRatings = async function(tourId){
    //this points to current model
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group:{
                _id : '$tour',
                nRating: {$sum : 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ])
    
    //if check if stats is empty, happens when
    //delete all the review of a particular tour
    if(stats.length != 0){
        
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: stats[0].nRating ,
            ratingsAvgerage: stats[0].avgRating
        })
    }
    else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: 0,
            ratingsAvgerage: 4.5
        })
    }
    
}




//NOTE - post middleware doesnot get access to the next 
// we use post middleware becuz, we want to run the 
//aggregate function only after a doc is saved
reviewSchema.post('save', function(){
    //this points to current review documents
    this.constructor.calcsAverageRatings(this.tour)
    
})

//up to this point we actually able to add nRating and AvgRating when a new review
// is created
//but we also we need to update tour doc when we update a current review or
// delete a review
// update - findByIdAndUpdate
// delete - findByIdandDelete

// these two above function come under the query pre/post hook middleware
// and query hook does not have access to the current document
// so then how we get access to the current tourId


reviewSchema.pre(/^findOneAnd/, async function(next){
    //here we cannot use the aggregate function becuz
    // it is pre hook, data is not updated/delted upto this
    try{
        this.r = await this.findOne()
    }
    catch( err){
        next( err)
    }
    

    // console.log(r)
    next()
})
reviewSchema.post(/^findOneAnd/, async function(){

    // this.r = await this.findOne() does not work here becuz the 
    // query is alredy executed in this post hook
    //therefore we pass the r object from pre hook to post hook
    //by this.r, and here we use the our aggregate function
    await this.r.constructor.calcsAverageRatings(this.r.tour)
    
})


const Review = mongoose.model('Review' , reviewSchema)

module.exports = Review