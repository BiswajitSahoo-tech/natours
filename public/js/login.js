import axios from "axios"
import { showAlerts } from './alerts'

export const login = async  ( email , password) =>{
    console.log( email, password)
    try{
        const res = await axios( {
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email , 
                password
            }
           })


           if( res.data.status === 'success'){
            showAlerts('success' , 'Logged in successfully')
            // alert('success')
            window.setTimeout( ()=>{
                location.assign('/')
            } , 1500)
           }
           console.log( res)
    } catch( err){
        showAlerts( 'error' , 'Incorrect Details')
        // alert('fail')
    }
   
}

export const logout = async ()=>{
    try{
        const res = await axios( {
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
            
        })
        if( res.data.status === 'success')
            location.reload(true)// true is required becuz we want a page from server not from cache
    } catch ( err){
        showAlerts('error', 'try again')
    }
}

