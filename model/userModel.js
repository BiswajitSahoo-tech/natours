const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const userSchemaObject = {
    name:{
        type: String,
        required: [true , 'A user must have an user name'],
        maxLength: 50,
        minLength: 3,
        trim: true
    },
    email:{
        type: String,
        required: [true , 'A user must have an user email'],
        minLength: 5,
        trim: true,
        unique: true,
        lowercase: true,
        validate : [validator.isEmail , 'please provide a valid email']
    },
    photo:{
        type:String,
        default: 'default.jpg'
        //default field for the new users having no dp
        // required: [false , 'A user must have an user dp']
    },
    password:{
        type : String , 
        required: [true , 'A user must have an user pwd'],
        
        minLength: 8,
        select: false // this schema type option will not select password 
                      //field when we are quering anything
    },
    passwordConfirm :{
        type : String , 
        required: [true , 'A user must have an user pwd'],
        
        minLength: 8,
        validate:{
            //this only work on save / create
            validator: function(el){
                return el === this.password
            },
            message: "pwd are not same"
        }
    },
    passwordChangedAt: Date,
    role:{
        type: String,
        enum: ['user' , 'guide' , 'lead-guide' , 'admin'],
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExipres: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
}


// fat model thin controller philloshopy
const userSchema =  new mongoose.Schema(userSchemaObject)

// we are gona use save for update aswel
//save pre hook middleware run before the document get save/ updated
//all the pre/post hook are defind on the schema itself

userSchema.pre('save' , async function(next){
    //check whether the doc.pwd is modified
    if(!this.isModified('password'))
        return next()
    //encrypt the pwd at 12 cost
    try{
        this.password = await bcrypt.hash(this.password, 12)
        this.passwordConfirm = undefined// to remove from doc before commiting
        next()
    }
    catch(err){
        res.status(500).json({
            status: 'fail',
            err
        })
    }
    
})

userSchema.pre('save' , function(next){
    if(!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

//instance method available for the all the document of certain collection

userSchema.methods.correctPassword = async function(candidatePassword , userPassword){
    return await bcrypt.compare(candidatePassword , userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10)
        // console.log(changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExipres = Date.now() + 10*60*1000
    return resetToken
}

userSchema.pre(/^find/ , function(next){
    //only work on query
    this.find({ active: {
        $ne: false
    }})
    next()
})

const User = mongoose.model('User' , userSchema)

module.exports = User