const Tour = require('./../model/tourModel')
const AppError = require('./../util/appError')
const User= require('./../model/userModel')
const Booking= require('./../model/bookingModel')


exports.getOverview = async (req , res)=>{
    //1) get all tour data from our collection
    const tours = await Tour.find()
    //2) Build template
    //3) render that template using tour data from 1)

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
}

exports.getTour = async (req , res , next)=>{
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if( !tour){
        return next( new AppError('No Tour with that name..', 404))
    }


    res.status(200)
    .render('tour', {
        title: tour.name,
        tour
    })
}

exports.getLoginForm =  ( req, res )=>{
    res.status(200).render('login',{
        title: 'Sign In'
    })
}
exports.getSignupForm = (req, res)=> {
    res.status(200).render('signup',{
        title: 'Sign Up❤️'
    })
}

exports.getAccount = ( req, res)=>{
    res.status(200).render('account',{
        title: 'Your Account'
    })
}


exports.updateUserData = async ( req, res, next)=>{
    const user = await User.findByIdAndUpdate( req.user.id ,{
        name: req.body.name,
        email: req.body.email
    },{
        new : true,
        runValidators: true
    })
    
    res.status(200).render('account',{
        title: 'Your Account',
        user: user //need to pass the updated user to the pug file
    })
}

exports.getMyTours = async (req, res, next)=>{
    //1) find all booking
    const bookings = await Booking.find( {
        user: req.user.id
    })

    const tourIDs = bookings.map( el=> el.tour)

    const tours = await Tour.find({
        _id: {
            $in: tourIDs
        }
    })

    res.status(200).render('overview',{
        title: 'My Tours',
        tours
    })

}