//here most of the code are related to the user data, and according to that
// it delegate the action
import '@babel/polyfill'
import { displayMap } from './mapbox'
import { login, logout } from './login' 
import {  updateSettings } from './updateSettings'
import { bookTour } from './stripe'


//dom elements 
const mapbox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour');


//values

 

//delegation mapping
if(mapbox){
    const locations = JSON.parse(document.getElementById('map').dataset.location)
    displayMap(locations)
}




if(loginForm){
    
    document.querySelector('form').addEventListener('submit' , e =>{
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        console.log( email , password)
        login( email , password)
    })
}

if(logOutBtn){
    logOutBtn.addEventListener('click' , logout)
}

if( userDataForm){
    
    userDataForm.addEventListener('submit',(e )=>{
        e.preventDefault()
        //creating the enctype form data
        const form = new FormData()
        form.append('email', document.getElementById('email').value)
        form.append('name', document.getElementById('name').value)
        form.append('photo', document.getElementById('photo').files[0])

        console.log(form)

        updateSettings(form , 'data')
    })
   
}

if( userPasswordForm){
    
    userPasswordForm.addEventListener('submit',async (e )=>{
        e.preventDefault()
        document.querySelector('.btn--save-password').innerHTML = 'Updating...'
        const currentPassword = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value

        //console.log(passwordConfirm, passwordCurrent, password)
        await updateSettings({currentPassword ,password,passwordConfirm} , 'password')

        document.querySelector('.btn--save-password').innerHTML = 'Save Password'

        document.getElementById('password-current').value= '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value= '';
    })
   
}

// "currentPassword": "test1234",
//     "password": "london@me",
//     "passwordConfirm": "london@me"
   
if( bookBtn){
    bookBtn.addEventListener('click',async e=>{
        e.target.innerHTML = 'Processing...'
        const tourId = e.target.dataset.tourId
        await bookTour(tourId)
        e.target.innerHTML = 'Redirecting..'

    })
}