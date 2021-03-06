const express=require('express')
const router=express.Router()
const { isAuthenticatedUser,authorizeRoles }=require('../middlewares/authMiddleware')

// importing ticket controller
const { bookTicket,
    updateTicket,
    ticketStatus,
    detailedTicketStatus,
    allTickets,
    cancelTicket,
    resetServer 
} = require('../controllers/ticketsController')
router.route('/ticket/book').post(isAuthenticatedUser,authorizeRoles('customer','agent','admin'),bookTicket)
router.route('/ticket/cancel/:id').put(isAuthenticatedUser,cancelTicket)
router.route('/ticket/update/:id').put(isAuthenticatedUser,updateTicket)
router.route('/ticket/status/:id').get(ticketStatus)
router.route('/ticket/detail-status/:id').get(detailedTicketStatus)
router.route('/ticket/all/:date/:status').get(allTickets)
router.route('/reset/:date').put(isAuthenticatedUser,authorizeRoles('admin'),resetServer)

module.exports=router