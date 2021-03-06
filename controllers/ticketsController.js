const ticketsDB=require('../models/ticketsModel')
const catchAsyncError=require('../middlewares/catchAsyncError')
const errorHandlerClass=require('../utils/errorHandlerClass')

// book ticket => api/v1/ticket/book
exports.bookTicket=catchAsyncError( async (req,res,next)=>{
    const dateObject=new Date(req.body.date_of_travel)
    if (dateObject!='Invalid Date'){
        now=new Date()
        now.setHours(0,0,0,0)
        // ticket can't be booked in previous date
        if (dateObject<now){
            return next( new errorHandlerClass("Ticket can't be booked with old date",400))
        }
        const ticketsBooked=await ticketsDB.find({$and:[{date_of_travel:dateObject.toISOString()},{status:"Booked"}]})
        if (ticketsBooked.length>=40){
            return next( new errorHandlerClass("sorry seats full",200))
        }
        else{
            // adding user to req body
            req.body.user=req.user.id
            const booking=await ticketsDB.create(req.body)
            res.status(200).json({
                success:true,
                message:"Ticket Booked",
                data:booking
            })}
    }else{
        return next( new errorHandlerClass("please provide date of travel",400))
    }
})
// cancel ticket => api/v1/ticket/cancel/:id
exports.cancelTicket=catchAsyncError( async(req,res,next)=>{
    const ticket=await ticketsDB.findByIdAndUpdate(req.params.id,{"status":"Cancelled"},{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    if (!ticket){
        return next( new errorHandlerClass("wrong id",404))
    }
    // check owner of the ticket
    if (ticket.user.toString() !== req.user.id ){
        return next(new errorHandlerClass(`Current user ${req.user.id} is not allowed update details of this ticket`,403))
    }
    res.status(200).json({
        success:true,
        message:"Ticket cancelled",
        data:ticket
    })
})
// update details api/v1/ticket/update/:id
exports.updateTicket=catchAsyncError(async(req,res,next)=>{
    const ticket=await ticketsDB.findById(req.params.id)
    if (!ticket){
        return next( new errorHandlerClass("wrong id",404))
    }
    // check owner of the ticket
    if (ticket.user.toString() !== req.user.id ){
        return next(new errorHandlerClass(`User ${req.user.id} is not allowed update details of this ticket`,403))
    }
    // checks for status in request body
    if ('status' in req.body){
        return next( new errorHandlerClass("status can't be updated",403))
    }
    if (ticket.status==="Cancelled"){
        return next( new errorHandlerClass("cancelled ticket can't be updated",403))
    }
    const updatedTicket=await ticketsDB.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,
        message:"updated successfully",
        data:updatedTicket
    })
})
// view ticket status =>api/v1/ticket/status/:id
// @id is object_id
exports.ticketStatus=catchAsyncError( async(req,res,next)=>{
    const ticket=await ticketsDB.findById(req.params.id)
    if (!ticket){
        return next( new errorHandlerClass("wrong id",404))
    }
    res.status(200).json({
        success:true,
        data:ticket.status
    })
})
// view detailed ticket status =>api/v1/ticket/detail-status/:id
// @id is object_id
exports.detailedTicketStatus=catchAsyncError( async (req,res,next)=>{
    const ticket=await ticketsDB.findById(req.params.id)
    if (!ticket){
        return next( new errorHandlerClass("wrong id",404))
    }
    res.status(200).json({
        success:true,
        data:ticket
    })

})
// view all tickets where status is booked/cancelled
// => api/v1/ticket/all/:date/:status
// @date in the YYYY-MM-DD format
// @status either in Booked or Cancelled (first letter capital)
exports.allTickets=catchAsyncError( async (req,res,next)=>{
    const dateObject=new Date(req.params.date)
    const alltickets=await ticketsDB.find({$and:[{date_of_travel:dateObject.toISOString()},{status:req.params.status}]})
    if (alltickets.length===0){
        res.status(200).json({
            success:false,
            message:"no tickets found"
        })
    }
    res.status(200).json({
        success:true,
        message:`${alltickets.length} tickets found`,
        data:alltickets
    })
})
// reset server for admin =>api/v1/reset/:date
exports.resetServer=catchAsyncError(async(req,res,next)=>{
    const dateObject=new Date(req.params.date)
    now=new Date()
    now.setHours(0,0,0,0)
    if (dateObject<now){
        return next( new errorHandlerClass("History can't be changed",400))
    }
    const alltickets=await ticketsDB.find({date_of_travel:dateObject.toISOString()})
    arr=[]
    for (let i=0;i<alltickets.length;i++){
        let currentTicket=await ticketsDB.findByIdAndUpdate(alltickets[i]._id,{'status':'Cancelled'},{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
        arr.push(currentTicket)
    }
    res.status(200).json({
        success:true,
        message:`${alltickets.length} tickets reset to cancelled`,
        data:arr
    })
})

