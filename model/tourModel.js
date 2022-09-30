const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')


const tourSchemaObject = {
    name : {
        type: String,
        unique: true,
        required: [true , 'A tour must have a name'],
        trim:true,
        maxLength:[40 , 'name Must less than 40'],
        minLength:[10, 'name must large than 10']
        // validate:[validator.isAlpha , 'hee']
    },
    slug:String,
    duration: {
        type: Number,
        required: [true , 'A tour must have a duration']
    },
    maxGroupSize :{
        type: Number,
        required: [true , 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true , 'A tour must have a difficulty'],
        enum:{
            values: ['easy' , 'medium', 'difficult'],
            message:"Must any one of 'easy' , 'medium', 'difficult' "
        }
    },
    ratingsAvgerage: {
        type : Number,
        default: 4.5,
        min:[1.0,'rating must large than 1.0'],
        max:[5.0,'rating must smaller than 5.0'],
        //setter function is goana run each time we are setting 
        // new value to this field
        set: val=> Math.round(val * 10) / 10
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    rating : {
        type: Number,
        default: 4.5,
        min:[1.0,'rating must large than 1.0'],
        max:[5.0,'rating must smaller than 5.0']
    },
    price:{
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        default: 0,
        validate:{
            validator: function(val){
                return val < this.price
            },
            message:'kya !!'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true , 'Must have a summary']
    },
    description: {
        type: String,
        required: [true , 'Must have a description'],
        trim: true
    },
    imageCover: {
        type: String,
        required: [true , 'Must have a image']

    },
    images: [String],
    createdAt:{
        type: Date,
        
        default: Date()
    },
    startDates: [Date],
    secret:{
        type: Boolean,
        default: false
    }, // these are the schema type object

    startLocation:{ 
        
        // this are not the schema type object
        //geoJSON to specify the geospatial data
        //to specify the geospatial data on mongoDB we have to pass the 
        //an object not an schema type option object, the GEO object must
        //contain atleast two field , type and coordinates
        // here we are not embedding , bcuz it is only one.

        type:{
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates:[Number], // longitude latitudes
        address: String,
        description: String
        
    },

    //to embedd the doc into a doc we use array of object,
    // object defination inside the array,
    //each time we created a new documnets, mongoose create the
    //new documents from defination and embedd it to the parent one
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ], 

    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
            //we created a reference to the User Model
            //effectivly linking two models
        }
    ]

}
const SchemaOption = {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
}
const tourSchema = new mongoose.Schema( tourSchemaObject , SchemaOption)


//single field index
// tourSchema.index({price: 1})// 1 - increasing , -1 - decreasing

//compund field index -> work even with individual field
tourSchema.index({price: 1 , ratingsAvgerage: -1})
tourSchema.index({ slug: 1})

//2dSpeher - real point on earth
//2d - imaginary point on a 2d plane
//indexing of startLocation is imp for the geospatial query
tourSchema.index({startLocation: '2dsphere'})

tourSchema.virtual('DurationWeeks').get( function() {
    return this.duration/7
})

tourSchema.virtual('reviews' , {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//Document Middleware/hooks, mongoose pre save middleware, run before .save() , .create(),
tourSchema.pre('save', function(next){
    // console.log(this)
    this.slug = slugify(this.name , {lower:true})
    next()

})
tourSchema.pre('save', function(next){
    // console.log(this)
    // console.log('saving document...')
    next()

})

//below pre save hook is for embedding user docs, but we opt for child referencing
// tourSchema.pre('save' , async function(next){
//     // let  guidesPromises = this.guides.map(async id => 
//     //     await User.findById(id)
//     // )
//     // //now the guidesPromises are full of promises, which are need to be awaited
//     // this.guides = await Promise.all(guidesPromises)

//     next();
// })

tourSchema.post('save' , function(doc , next){
    // console.log(doc)
    next()
})


//Query middleWare
tourSchema.pre(/^find/ , function(next){
    this.find({secret:{$ne:true}})
    next()
})
tourSchema.pre(/^find/ , function(next){
    this.populate({
        path:'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})


tourSchema.post('/^find/' , function(docs,next){
    // console.log(docs)
    next()
})

//Aggregate middleware
// tourSchema.pre('aggregate' , function(next){
//     this.pipeline().unshift({
//         $match: {
//             secret:{
//                 $ne:true
//             }
//         }
//     })
//     console.log(this.pipeline())
//     next()
// })
const Tour = mongoose.model('Tour' , tourSchema)

module.exports = Tour