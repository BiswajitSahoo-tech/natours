const express = require('express')
const toursController = require('./../controller/toursController')
const authController = require('./../controller/authController')
const reviewRouter = require('./../routes/reviewRoutes')
const Tour = require('../model/tourModel')

const tourRouter = express.Router()


//router merging
tourRouter.use('/:tourId/reviews' , reviewRouter)



tourRouter.route('/monthly-plan/:year').get(authController.protect, authController.restrictsTo('admin', 'lead-guide','guide') ,toursController.getMonthlyPlan)
tourRouter.route('/stats')
                        .get(toursController.getTourStats)
tourRouter.route('/top-5-cheap')
                                .get(toursController.top5chepfill , toursController.get_all_tours)

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit')
          .get(toursController.getToursWithin)

tourRouter.route('/distances/:latlng/unit').get(toursController.getDistances)

tourRouter.route('/')
                    .get( toursController.get_all_tours)
                    .post(authController.protect , authController.restrictsTo('admin' , 'lead-guide'), toursController.addTour)

tourRouter.route('/:id')
                    .get(toursController.get_tour)

                    .patch(authController.protect, 
                            authController.restrictsTo('admin', 'lead-guide') ,
                            toursController.uploadTourImages,
                            toursController.resizeTourImages,
                            toursController.update_tour)

                    .delete(authController.protect, authController.restrictsTo('admin', 'lead-guide') ,toursController.delete_tour)



// tourRouter.route('/:tourId/reviews/')
//           .post(authController.protect , authController.restrictsTo('user') , reviewController.createReview)


tourRouter.patch('/test/:id',async (req, res, next)=> {
        const id = req.params.id
        try{
                var tour =  await Tour.findByIdAndUpdate(id , {
                        $inc:{
                                maxGroupSize:1
                        }
                })
        }
        catch( err){
                return next( err)
        }
        
        res.status(200).json( {
                status: 'success',
                tour
        })
})
module.exports = tourRouter