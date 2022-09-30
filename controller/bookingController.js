const Tour = require('./../model/tourModel')
const stripe = require('stripe')('sk_test_51LjGYDSA8Zve3mCv8Kz1o27yCf21JbMKpYBIAIwUdMgTcGxP3e2JraXZVarjxOyYTP25Nr4gz1YO8FcFBOUT4PVl00UpB0OxbN')
const Booking = require('./../model/bookingModel')
const factory = require('./../controller/handlerFactory')


exports.getCheckoutSession =async (req, res, next)=>{
    //get the cuurently booked tour
    const tour = await Tour.findById(req.params.tourId)
    // console.log(tour)
    // console.log(stripe)

    //create the checkout session
    const session = await stripe.checkout.sessions.create({

        //info about the session
        payment_method_types: ['card'],
        success_url: req.protocol+'://'+req.get('host')+'/?tour='+req.params.tourId+'&user='+req.user.id+'&price='+tour.price ,
        cancel_url: req.protocol+'://'+req.get('host')+'/tour'+tour.slug,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,

        //info about the product purchased
        line_items: [
            {
                price_data:{
                    product_data:{
                        name: tour.name+' Tour',
                        description: tour.summary,
                        images: [ 'https://www.natours.dev/img/tours/tour-1-cover.jpg']
                    },
                    unit_amount: tour.price * 100,
                    currency:'usd',
                    
                },
                quantity:1

            }
        ],
        mode: 'payment'

    })


    //create session as response
    res.status(200).json({
        status: 'success', 
        session
    })
    // res.redirect( 303 , session.url)
}

exports.createBookingCheckout =async  ( req, res ,next)=>{
    const { tour , user, price} = req.query
    if((!tour) || (! user) || (!price)) return next()
    
    await Booking.create( {tour , user, price})

    //removing the query part from the req
    //req.redirect makes another req to input 
    res.redirect(req.originalUrl.split('?')[0])
}

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.updateBooking= factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
exports.getAllBookings = factory.getAll(Booking)