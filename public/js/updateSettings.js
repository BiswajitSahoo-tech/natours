import axios from "axios"
import { showAlerts } from "./alerts"

//type is either pwd and data
export const updateSettings = async  ( data, type) =>{
    
    try{
        const url = type ==='password'? 'http://127.0.0.1:3000/api/v1/users/updatePassword/': 'http://127.0.0.1:3000/api/v1/users/updateMe/'
        const res = await axios( {
            method: 'PATCH',
            url,
            data
           })


           if( res.data.status === 'success'){
                const d = type ==='password'? 'PASSWORD' :'DATA'
                showAlerts('success' , d+' updated successfully')
                // alert('success')
                location.reload(true)
           }
           console.log( res)
    } catch( err){
        console.log( err)
        showAlerts( 'error' ,  err.response.data.message)
        // alert('fail')
    }
   
}