const stripe = Stripe('pk_test_51LjGYDSA8Zve3mCvmd4Zl3MgA12cnIfedKaabFpIUqrDrRzCa6Rsu4YLl5VQwHUPm6TCxHXdg6f8moAccQlY2q5t00MWrJZ7SN')
import axios from "axios"
import { showAlerts } from "./alerts"

export const bookTour = async tourId =>{
    //1) get the session from server using checkout endpoint
    try{
        const session = await axios('/api/v1/booking/checkout-session/'+tourId)
        // console.log( session)

        // //2) Create checkout from + charge the credit card
        window.location.replace(session.data.session.url);
        // console.log(session.data.session.url)
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // })
    }catch( err){
        // console.log( err)
        showAlerts('error', err)

    }
    
    
    
}