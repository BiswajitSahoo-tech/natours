module.exports = fn=>{
    return (req,res,next)=>{
        fn(res, req, next).catch(err=> next(err))
    }
    
}