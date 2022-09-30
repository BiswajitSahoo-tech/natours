const path = require('path')
const express = require('express')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const AppError = require('./util/appError')
const errorController = require('./controller/errorController')
const rateLimit = require('express-rate-limit')
const helmet =  require('helmet')
const mongoSantize = require('express-mongo-sanitize')
const xss =  require('xss-clean')
const hpp = require('hpp')
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const cookieParser = require('cookie-parser')
const compression = require('compression')


const app = express()

//template engine - pug,
//express support pug out of the box
//no need to install or require
//we have to tell express which template engine to
//use
app.set('view engine' , 'pug')

//it can be the relative path to the root folder
//but this will be not the case everytime,
//therefore we are using absolute path
app.set('views' , path.join( __dirname , 'views'))



app.use(express.static( path.join( __dirname , 'public'))) //TO SERVE STATIC FILE

//set security HTTp header
app.use(helmet()) //->> put it first

//Add the following
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://cdnjs.cloudflare.com/ajax/libs/axios/0.27.2/axios.js",
    "https://js.stripe.com/v3/"
];
const styleSrcUrls = [
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




//limit the number of request
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 *1000,
    message: 'Too many request...' 
})

app.use('/api',limiter) // --> this only apply limiter middleware to the /api route





//body parser from data in body to req.body-- cannot parse the file field
//in multi part form data
app.use(express.json({ limit : '10kb'})) //middleware
app.use(express.urlencoded({extended: true, limit: '10kb'}))
app.use(cookieParser())



//Data sanitisation against NOSQL query injection and XSS
app.use(mongoSantize());//check out the req.body, req.param , req.query and remove the $ and .
app.use(xss())// -> remove the html tags from the input data

//handle the parameter pollution, remove duplicate
app.use(hpp({
    whitelist: ['duration' , 'ratingQuantity' , 'ratingAverages' , 'price']
}))

app.use( compression()) //->only for text

//only use logger when the app is in development environment
if(process.env.NODE_ENV === 'dev'){
    app.use(morgan('dev'))
}

// app.use( (req , res, next) =>{
//     // console.log('I am a middleWare 😒😒😒😒😊❤️❤️❤️❤️❤️😒😒😒')
//     next()
// })
app.use( (req, res, next) => {
    req.t = new Date()
    // console.log(req.cookies)
    next()
})

// app.get('/api/v1/tours',get_all_tours )
// app.get('/api/v1/tours/:id', get_tour)
// app.post('/api/v1/tours', addTour)
// app.patch('/api/v1/tours/:id' , update_tour)




//ROUTER MIDDLEWARE
// app.route('/api/v1/tours').get((req,res) => {
//     res.status(200).json({
//         status: "success",

//     })
// })


//ROUTER MIDDLEWARE
//render function will look for the mentaioned field
//and then render the pug code
app.use('/' , viewRouter)
app.use('/api/v1/tours',tourRouter )
app.use('/api/v1/users' ,  userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/booking', bookingRouter)

app.all('*' , (req , res,next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     msg: "Could not find the route"
    // })
    // let err = new Error('Could not find the route')
    // err.statusCode = 404
    // err.status = 'fail'
    next(new AppError('Could not find the route' , 404))
})

app.use( errorController)


module.exports = app








// const express = require('express')
// const app = express()
// app.get('/' , (req,res) => {
//     console.log(req.header)
//     res.status(404).jsonp({'a':"aa",'aa' : "fff"})
// })
// const port = 3000
// app.listen(port, ()=> {
//     console.log('server is waiting.....')
// })

// const htp = require('http')
// const server = htp.createServer()
// // server.on("request", (req, res)=> {
// //     res.end('he')
// // })
// server.on("close",() => {
//     console.log('bye')
// })
// server.listen(3000,'127:0:0:1', ()=>{console.log('server is waiting......')})