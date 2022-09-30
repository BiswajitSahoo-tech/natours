const express = require('express')
const authController = require('./../controller/authController')
const reviewController = require('./../controller/reviewController')

const router = express.Router({
      mergeParams: true
})

//actually the router get access to the params specific to that router 
//only but here we need a param from another router behind
// hence we go for thr mergeParams


router.use( authController.protect)

router.route('/')
      .get(  reviewController.getAllReviews)
      .post( authController.protect , authController.restrictsTo('user'),reviewController.setTourUserIds , reviewController.createReview )

router.route('/:id')
      .get(authController.protect ,  reviewController.get_review)
      .patch(authController.restrictsTo('user' , 'admin') , authController.protect ,  reviewController.update_review)
      .delete( authController.restrictsTo('user' , 'admin') ,authController.protect ,  reviewController.delete_review)

module.exports = router