const mongoose=require('mongoose');

const ticketsSchema=new mongoose.Schema({
    date_of_travel:{
        type:Date,
        required:[true,"please provide date"]
    },
    name:{
        type:String,
        trim:true,
        maxlength : [50, 'please use shorter name']
    },
    age:Number,
    gender:{
        type:String,
        enum : {
            values : [
                'male',
                'female'
            ],
            message : 'Please select from male or female'
        }
    },
    Mobile:{
        type:Number,
        maxlength : [10, 'mobile number should be at max 10 digits']
    },
    validation_id_no:{
        type:String,
        required:[true,"validation id is must"]
    },
    status:{
        type:String,
        enum : {
            values : [
                'Booked',
                'Cancelled'
            ],
            message : 'ticket can be either booked or cancelled'
        }
    }
})
module.exports=mongoose.model('ticketsDB',ticketsSchema)