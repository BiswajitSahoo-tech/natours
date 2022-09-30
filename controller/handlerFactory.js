const AppError = require("../util/appError")
const APIFeatures = require('./../util/apiFeatures')

exports.deleteOne = Model => async (req , res , next)=> {
    try{
        const doc = await Model.findByIdAndDelete(req.params.id)
        if(!doc){
            return next( new AppError('No Doc found with that Id',404))
        } 
        res.status(200).json({
            status: 'success',
            msg: doc
        })
    }catch( err){
        return next( err)
    }
}

exports.updateOne = Model => async (req, res , next) => {
    try{
        const  doc = await Model.findByIdAndUpdate(req.params.id , req.body , {
            new: true,
            runValidators: true
        })

        if(!doc){
            return next( new AppError('Id is not found',404))
        }

        res.status(200).json({
            status : "success",
            body : doc
        })
    }catch( err){
        next( err)
    }

    
}

exports.createOne = Model => async (req ,res , next) => {

    try{
        const doc = await Model.create(req.body)
        res.status(201).json({
            status : 'success',
            data: doc
        })
    }catch(err){
        next( err)

    }

    
}

exports.getOne = (Model , popOpt)=> async (req, res,next) => {
    
    try{
        //below popOpt is for Tour model where we need to poplulate the
        // review fields, popOut is passed in Tour case, not in all case, then popOpt is undefined
        const query = Model.findOne( {_id : req.params.id})
        if(popOpt) 
            query.populate( popOpt)
        const doc = await query

        
        if(!doc){
                return next( new AppError('Id is not found',404))
        }
        res.status(200).json({
            status:'success',
            body: doc
        })
    }catch( err){
        next( err)
    }
    

}


//basicaly due to below factory function
//every controller get all function 
// got the APIfeature -> filtering feature
exports.getAll = Model => async (req, res,next) => {
            
        try{

            //below filter is for review model where want to display all review only specific to the 
            //given tourId
            let filter = {}
            if(req.params.tourId)
                filter = {
                    tour : req.params.tourId
                }

            let intialQuery = Model.find( filter)
            let object = new APIFeatures(intialQuery , req)
                            .filter()
                            .sort()
                            .limitFields()
                            .pagination()
                        
    
            const arr = await object.query
    
    
            res.status(200).json({
                status: 'success',
                
                count : arr.length,
                data  : {
                    tours: arr
                }
            })
        }catch(err){
            next( err)
        }
        
}


