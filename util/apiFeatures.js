
class APIFeatures{
    constructor(query , req){
        this.query = query
        this.req = req
    }
    filter(){
        //copy an object
        const qObj = {...this.req.query}
        //removing excluding term from query object
        const excld_arr = [ 'sort' , 'page' , 'limit' , 'fields']
        excld_arr.forEach(elm => {
            delete qObj[elm]
        })
        //Filter Object
        // {duration: 5,rating:4.5}
        // {duration:{ $lt : 5} , rating:{ $gte : 4.5}} -> MongoDB required
        //{duration:{ lt : 5} , rating:{ gte : 4.5}} -> express gives from req.query
        let qstr = JSON.stringify(qObj)
        qstr = qstr.replace(/\b(gt|gte|lt|lte)\b/g , match=> '$'+match)
        this.query = this.query.find(JSON.parse(qstr))

        return this
    }
    sort(){
        if(this.req.query.sort){
            let str = this.req.query.sort.split(',').join(' ')
            console.log(str)
            this.query = this.query.sort(str) // this.query.sort('price Avgrate')
        }else{
            this.query = this.query.sort('createdAt')
        }
        return this
    }
    limitFields(){
        if(this.req.query.fields){
            //query = query.select('name price discount')// only include name price and discount
            //query = query.select('-name price') // for not including name 
            //req.query.field = 'name,price,-discount'
            let str = this.req.query.fields.split(',').join(' ')
            this.query = this.query.select(str)
        }else{
            this.query = this.query.select('-__v')
        }
        return this
    }
    pagination(){
        let pge = (this.req.query.page*1) || 1
        let lmt = (this.req.query.limit*1)||100 
        this.query = this.query.skip((pge-1)*lmt).limit(lmt)

        // if(req.query.page){
        //     const n = await Tour.countDocuments() // count the number of the documents that matches the query
        //     if( n <= (pge-1)*lmt)
        //         throw new Error('Too much to skip')
        // }

        return this
    }

}
module.exports = APIFeatures